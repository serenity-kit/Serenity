import sodium from "react-native-libsodium";
import { createWorkspaceIntegrityProof } from "./createWorkspaceIntegrityProof";
import { WorkspaceIntegrityData } from "./types";

let authorKeyPair: sodium.KeyPair;

beforeEach(async () => {
  await sodium.ready;
  authorKeyPair = sodium.crypto_sign_keypair();
});

test("should generate a valid workspace integrity hash and signature", () => {
  let workspaceIntegrityData: WorkspaceIntegrityData = {
    clock: 0,
    workspaceInfoCiphertext: "testCiphertext",
    workspaceInfoNonce: "testNonce",
    folderTreeRootHash: "testRootHash",
    workspaceChainHash: "testChainHash",
    userChainHashes: { userId: "testUserHash", userId2: "testUserHash2" },
  };

  const result = createWorkspaceIntegrityProof({
    workspaceIntegrityData,
    authorKeyPair,
  });

  expect(result.hash).toBe(
    "ez30PvXHKxIL1La-Sc5SpW8SQT9dKXTB0D6ZJv_AWasGVt8IsYWhV70kdXOHQRu41gEXrZqyCVw9rkPnMSG16A"
  );
  expect(result.hashSignature).toBeDefined();
  expect(result.version).toBe(0);
});

test("should fail when passing in a function for a workspaceData entry", () => {
  let workspaceIntegrityData: WorkspaceIntegrityData = {
    clock: 0,
    // @ts-expect-error NaN is not allowed in canonicalize
    workspaceDataCiphertext: NaN,
    workspaceDataNonce: "testNonce",
    folderTreeRootHash: "testRootHash",
    workspaceChainHash: "testChainHash",
    userChainHashes: { userId: "testUserHash", userId2: "testUserHash2" },
  };

  expect(() => {
    createWorkspaceIntegrityProof({
      workspaceIntegrityData,
      authorKeyPair,
    });
  }).toThrowError();
});
