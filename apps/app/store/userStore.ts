import * as sql from "./sql/sql";
import { getLastUserChainEvent } from "./userChainStore";

export const table = "user_v1";

export const initialize = () => {
  sql.execute(
    `CREATE TABLE IF NOT EXISTS "${table}" (
      "id"	TEXT NOT NULL,
      "username"	TEXT NOT NULL,
      PRIMARY KEY("id")
    );`
  );
};

type User = {
  id: string;
  username: string;
};

export const createUser = (params: User) => {
  // id and username can not change so we can use INSERT OR IGNORE
  sql.execute(`INSERT OR IGNORE INTO ${table} VALUES (?, ?);`, [
    params.id,
    params.username,
  ]);
};

export const getLocalUserByDeviceSigningPublicKey = ({
  signingPublicKey,
  includeExpired,
  includeRemoved,
}: {
  signingPublicKey: string;
  includeExpired?: boolean;
  includeRemoved?: boolean;
}) => {
  const users = sql.execute(`SELECT * FROM ${table}`) as User[];

  const user = users.find((user) => {
    const userChainEventResult = getLastUserChainEvent({ userId: user.id });
    if (!userChainEventResult) return false;

    const devices = userChainEventResult.state.devices;
    if (devices[signingPublicKey]) {
      if (includeExpired) {
        return true;
      }

      const expiresAt = devices[signingPublicKey].expiresAt;
      if (expiresAt === undefined) {
        return true;
      } else if (new Date(expiresAt) > new Date()) {
        return true;
      } else {
        return false;
      }
    }

    const removedDevices = userChainEventResult.state.removedDevices;
    if (includeRemoved && removedDevices[signingPublicKey]) {
      return true;
    }
    return false;
  });

  if (!user) return undefined;

  const userChainEventResult = getLastUserChainEvent({ userId: user.id });
  return {
    ...user,
    mainDeviceSigningPublicKey:
      userChainEventResult.state.mainDeviceSigningPublicKey,
    devices: userChainEventResult.state.devices,
    removedDevices: userChainEventResult.state.removedDevices,
  };
};
