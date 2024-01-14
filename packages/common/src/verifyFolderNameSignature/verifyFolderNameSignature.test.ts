import sodium from "react-native-libsodium";
import { createDevice } from "../createDevice/createDevice";
import { encryptFolderName } from "../encryptFolderName/encryptFolderName";
import { createSubkeyId } from "../kdfDeriveFromKey/kdfDeriveFromKey";
import { verifyFolderNameSignature } from "./verifyFolderNameSignature";

const kdfKey = "3NmUk0ywlom5Re-ShkR_nE3lKLxq5FSJxm56YdbOJto";

beforeAll(async () => {
  await sodium.ready;
});

test("verify folder name signature", () => {
  const device = createDevice("user");
  const subkeyId = createSubkeyId();
  const result = encryptFolderName({
    parentKey: kdfKey,
    name: "Getting started",
    folderId: "abc",
    subkeyId,
    workspaceId: "xyz",
    keyDerivationTrace: {
      workspaceKeyId: "workspaceKey",
      trace: [],
    },
    workspaceMemberDevicesProof: {
      clock: 0,
      hash: "abc",
      hashSignature: "abc",
      version: 0,
    },
    device,
  });
  const verified = verifyFolderNameSignature({
    ciphertext: result.ciphertext,
    nonce: result.nonce,
    signature: result.signature,
    folderId: "abc",
    workspaceId: "xyz",
    keyDerivationTrace: {
      workspaceKeyId: "workspaceKey",
      trace: [],
    },
    workspaceMemberDevicesProof: {
      clock: 0,
      hash: "abc",
      hashSignature: "abc",
      version: 0,
    },
    authorSigningPublicKey: device.signingPublicKey,
  });
  expect(verified).toBe(true);
});
