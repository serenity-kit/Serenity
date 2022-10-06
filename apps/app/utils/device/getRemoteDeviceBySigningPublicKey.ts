import {
  DeviceBySigningPublicKeyDocument,
  DeviceBySigningPublicKeyQuery,
  DeviceBySigningPublicKeyQueryVariables,
} from "../../generated/graphql";
import { getUrqlClient } from "../urqlClient/urqlClient";

export type Props = {
  signingPublicKey: string;
};
export const getRemoteDeviceBySigningPublicKey = async ({
  signingPublicKey,
}: Props) => {
  const deviceResult = await getUrqlClient()
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
