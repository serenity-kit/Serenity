import { VerifiedUserFromUserChain } from "@serenity-tools/common";

type Params = {
  users: VerifiedUserFromUserChain[] | null;
  signingPublicKey: string;
};

export const findVerifiedUserByDeviceSigningPublicKey = ({
  users,
  signingPublicKey,
}: Params) => {
  if (!users) return null;

  return users.find((user) => {
    const nonExpiredSigningPublicKeys = user.nonExpiredDevices.map(
      (device) => device.signingPublicKey
    );
    if (nonExpiredSigningPublicKeys.includes(signingPublicKey)) {
      return true;
    }
    const expiredSigningPublicKeys = user.expiredDevices.map(
      (device) => device.signingPublicKey
    );
    if (expiredSigningPublicKeys.includes(signingPublicKey)) {
      return true;
    }
    const removedSigningPublicKeys = user.expiredDevices.map(
      (device) => device.signingPublicKey
    );
    return removedSigningPublicKeys.includes(signingPublicKey);
  });
};
