import { createDevice as createdDeviceHelper } from "@serenity-tools/common";
import { gql } from "graphql-request";

type Params = {
  graphql: any;
  authorizationHeader: string;
};

export const createDevice = async ({
  graphql,
  authorizationHeader,
}: Params) => {
  const authorizationHeaders = {
    authorization: authorizationHeader,
  };
  const query = gql`
    mutation createDevice($input: CreateDeviceInput!) {
      createDevice(input: $input) {
        device {
          userId
          signingPublicKey
          encryptionPublicKey
          encryptionPublicKeySignature
          info
        }
      }
    }
  `;

  const device = await createdDeviceHelper();

  const deviceInfoJson = {
    type: "web",
    OS: "MacOS",
    OsVersion: null,
    Browser: "chrome",
    BrowserVersion: "100.0.1",
  };
  const deviceInfo = JSON.stringify(deviceInfoJson);

  const result = await graphql.client.request(
    query,
    {
      input: {
        encryptionPublicKeySignature: device.encryptionPublicKeySignature,
        encryptionPublicKey: device.encryptionPublicKey,
        signingPublicKey: device.signingPublicKey,
        info: deviceInfo,
      },
    },
    authorizationHeaders
  );
  result.localDevice = device;
  return result;
};
