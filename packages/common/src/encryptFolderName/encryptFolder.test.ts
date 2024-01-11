import sodium from "react-native-libsodium";
import { createSubkeyId } from "../kdfDeriveFromKey/kdfDeriveFromKey";
import { encryptFolderName } from "./encryptFolderName";

const kdfKey = "3NmUk0ywlom5Re-ShkR_nE3lKLxq5FSJxm56YdbOJto";

beforeAll(async () => {
  await sodium.ready;
});

test("encryptFolderName", () => {
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
  });
  expect(typeof result.folderSubkey).toBe("string");
  expect(result.folderSubkey.length).toBe(43);
  expect(typeof result.folderSubkeyId).toBe("string");
  expect(typeof result.ciphertext).toBe("string");
  expect(typeof result.nonce).toBe("string");
  expect(typeof result.signature).toBe("string");
});
