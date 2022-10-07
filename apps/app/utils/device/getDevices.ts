import {
  Device,
  DevicesDocument,
  DevicesQuery,
  DevicesQueryVariables,
} from "../../generated/graphql";
import { getUrqlClient } from "../urqlClient/urqlClient";

export type Props = {
  hasNonExpiredSession: boolean;
};
export const getDevices = async ({
  hasNonExpiredSession,
}: Props): Promise<Device[] | null> => {
  const devicesResult = await getUrqlClient()
    .query<DevicesQuery, DevicesQueryVariables>(
      DevicesDocument,
      { hasNonExpiredSession, first: 500 },
      {
        requestPolicy: "network-only",
      }
    )
    .toPromise();
  if (devicesResult.error) {
    throw new Error(devicesResult.error.message);
  }
  if (devicesResult.data?.devices?.nodes) {
    return devicesResult.data?.devices?.nodes as Device[];
  } else {
    return null;
  }
};
