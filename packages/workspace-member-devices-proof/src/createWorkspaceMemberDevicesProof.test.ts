import sodium from "react-native-libsodium";
import { createWorkspaceMemberDevicesProof } from "./createWorkspaceMemberDevicesProof";
import { WorkspaceMemberDevicesProofData } from "./types";

let authorKeyPair: sodium.KeyPair;

beforeEach(async () => {
  await sodium.ready;
  authorKeyPair = sodium.crypto_sign_keypair();
});

test("should generate a valid workspace member devices hash and signature", () => {
  let workspaceMemberDevicesProofData: WorkspaceMemberDevicesProofData = {
    clock: 0,
    workspaceChainHash: "testChainHash",
    userChainHashes: { userId: "testUserHash", userId2: "testUserHash2" },
  };

  const result = createWorkspaceMemberDevicesProof({
    workspaceMemberDevicesProofData,
    authorKeyPair,
  });

  expect(result.hash).toBe(
    "0RbmFCuygmCKlUEg8yLlAk9U8debPr_D2--EX_UOr8T0oGNUNsO5GUbYgeAdiXLmDpKah2pbQoDZY2wjrFh5rw"
  );
  expect(result.hashSignature).toBeDefined();
  expect(result.version).toBe(0);
});

test("should fail when passing in NaN for a workspaceChainHash entry", () => {
  let workspaceMemberDevicesProofData: WorkspaceMemberDevicesProofData = {
    clock: 0,
    // @ts-expect-error NaN is not allowed in canonicalize
    workspaceChainHash: NaN,
    userChainHashes: { userId: "testUserHash", userId2: "testUserHash2" },
  };

  expect(() => {
    createWorkspaceMemberDevicesProof({
      workspaceMemberDevicesProofData,
      authorKeyPair,
    });
  }).toThrowError();
});
