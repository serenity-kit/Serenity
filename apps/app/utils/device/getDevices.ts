import { Client } from "urql";
import {
  Device,
  DevicesDocument,
  DevicesQuery,
  DevicesQueryVariables,
} from "../../generated/graphql";

export type Props = {
  urqlClient: Client;
};
export const getDevices = async ({
  urqlClient,
}: Props): Promise<Device[] | null> => {
  const devicesResult = await urqlClient
    .query<DevicesQuery, DevicesQueryVariables>(
      DevicesDocument,
      { first: 500 },
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
