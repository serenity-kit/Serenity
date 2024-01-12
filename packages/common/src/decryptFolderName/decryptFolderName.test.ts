import sodium from "react-native-libsodium";
import { createDevice } from "../createDevice/createDevice";
import { encryptFolderName } from "../encryptFolderName/encryptFolderName";
import { createSubkeyId } from "../kdfDeriveFromKey/kdfDeriveFromKey";
import { LocalDevice } from "../types";
import { decryptFolderName } from "./decryptFolderName";

const kdfKey = "3NmUk0ywlom5Re-ShkR_nE3lKLxq5FSJxm56YdbOJto";
let device: LocalDevice;

beforeAll(async () => {
  await sodium.ready;
  device = createDevice("user");
});

test("decryptFolderName", () => {
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
  const decryptFolderResult = decryptFolderName({
    parentKey: kdfKey,
    ciphertext: result.ciphertext,
    nonce: result.nonce,
    subkeyId: result.folderSubkeyId,
    folderId: "abc",
    signature: result.signature,
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
  expect(decryptFolderResult).toBe("Getting started");
});

test("decryptFolderName with publicData fails for wrong key", () => {
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
  expect(() =>
    decryptFolderName({
      parentKey: "4NmUk0ywlom5Re-ShkR_nE3lKLxq5FSJxm56YdbOJto",
      ciphertext: result.ciphertext,
      nonce: result.nonce,
      subkeyId: result.folderSubkeyId,
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
    })
  ).toThrowError(/Invalid robustness tag/);
});

test("decryptFolderName with publicData fails for wrong public data", () => {
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
  expect(() =>
    decryptFolderName({
      parentKey: kdfKey,
      ciphertext: result.ciphertext,
      nonce: result.nonce,
      subkeyId: result.folderSubkeyId,
      signature: result.signature,
      folderId: "WRONG",
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
    })
  ).toThrowError(/Invalid robustness tag/);
});
