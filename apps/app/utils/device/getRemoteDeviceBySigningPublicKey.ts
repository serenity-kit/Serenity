import { Client } from "urql";
import {
  DeviceBySigningPublicKeyDocument,
  DeviceBySigningPublicKeyQuery,
  DeviceBySigningPublicKeyQueryVariables,
} from "../../generated/graphql";

export type Props = {
  urqlClient: Client;
  signingPublicKey: string;
};
export const getRemoteDeviceBySigningPublicKey = async ({
  urqlClient,
  signingPublicKey,
}: Props) => {
  const deviceResult = await urqlClient
    .query<
      DeviceBySigningPublicKeyQuery,
      DeviceBySigningPublicKeyQueryVariables
    >(
      DeviceBySigningPublicKeyDocument,
      { signingPublicKey },
      {
        // better to be safe here and always refetch
        requestPolicy: "network-only",
      }
    )
    .toPromise();
  const device = deviceResult.data?.deviceBySigningPublicKey?.device;
  return device;
};
