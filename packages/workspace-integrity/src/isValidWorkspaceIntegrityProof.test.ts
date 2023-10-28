import sodium from "react-native-libsodium";
import { createWorkspaceIntegrityProof } from "./createWorkspaceIntegrityProof";
import { isValidWorkspaceIntegrityProof } from "./isValidWorkspaceIntegrityProof";
import { WorkspaceIntegrityData, WorkspaceIntegrityProof } from "./types";

const mockedVersionGetter = jest.fn();

jest.mock("./constants", () => {
  const originalModule = jest.requireActual("./constants");
  return {
    get version() {
      return mockedVersionGetter();
    },
    workspaceIntegrityProofDomainContext:
      originalModule.workspaceIntegrityProofDomainContext,
  };
});

let authorKeyPair: sodium.KeyPair;
let authorPublicKey: string;
let workspaceIntegrityProof: WorkspaceIntegrityProof;
let workspaceIntegrityData: WorkspaceIntegrityData;

beforeEach(async () => {
  await sodium.ready;
  authorKeyPair = sodium.crypto_sign_keypair();
  authorPublicKey = sodium.to_base64(authorKeyPair.publicKey);
});

beforeEach(() => {
  mockedVersionGetter.mockReturnValue(0);

  workspaceIntegrityData = {
    clock: 0,
    workspaceInfoCiphertext: "testCiphertext",
    workspaceInfoNonce: "testNonce",
    folderTreeRootHash: "testRootHash",
    workspaceChainHash: "testChainHash",
    userChainHashes: { userId: "testUserHash", userId2: "testUserHash2" },
  };

  workspaceIntegrityProof = createWorkspaceIntegrityProof({
    workspaceIntegrityData,
    authorKeyPair,
  });
});

it("should return true for a valid proof", () => {
  const result = isValidWorkspaceIntegrityProof({
    workspaceIntegrityData,
    authorPublicKey,
    workspaceIntegrityProof,
  });
  expect(result).toBe(true);
});

it("should return true for a valid with with pastKnownWorkspaceIntegrityProof provided", () => {
  const workspaceIntegrityProof = createWorkspaceIntegrityProof({
    workspaceIntegrityData,
    authorKeyPair,
  });

  const newWorkspaceIntegrityProof = createWorkspaceIntegrityProof({
    workspaceIntegrityData: {
      ...workspaceIntegrityData,
      clock: 1,
    },
    authorKeyPair,
  });

  const result = isValidWorkspaceIntegrityProof({
    workspaceIntegrityData: {
      ...workspaceIntegrityData,
      clock: 1,
    },
    authorPublicKey,
    workspaceIntegrityProof: newWorkspaceIntegrityProof,
    pastKnownWorkspaceIntegrityProof: workspaceIntegrityProof,
  });
  expect(result).toBe(true);
});

it("should return false for an invalid hash", () => {
  const result = isValidWorkspaceIntegrityProof({
    workspaceIntegrityData,
    authorPublicKey,
    workspaceIntegrityProof: {
      ...workspaceIntegrityProof,
      hash: "invalidHash",
    },
  });
  expect(result).toBe(false);
});

it("should return false for an invalid signature", () => {
  const result = isValidWorkspaceIntegrityProof({
    workspaceIntegrityData,
    authorPublicKey,
    workspaceIntegrityProof: {
      ...workspaceIntegrityProof,
      hashSignature: "invalidSignature",
    },
  });
  expect(result).toBe(false);
});

it("should return false if canonicalization fails for workspaceData", () => {
  const result = isValidWorkspaceIntegrityProof({
    workspaceIntegrityData: {
      ...workspaceIntegrityData,
      // @ts-expect-error NaN is not allowed in canonicalize
      workspaceInfoCiphertext: NaN,
    },
    authorPublicKey,
    workspaceIntegrityProof,
  });
  expect(result).toBe(false);
});

it("should return false if the version is larger than the current's client version", () => {
  mockedVersionGetter.mockReturnValue(100);

  workspaceIntegrityProof = createWorkspaceIntegrityProof({
    workspaceIntegrityData,
    authorKeyPair,
  });

  mockedVersionGetter.mockReturnValue(0);

  const result = isValidWorkspaceIntegrityProof({
    workspaceIntegrityData,
    authorPublicKey,
    workspaceIntegrityProof,
  });
  expect(result).toBe(false);
});

it("should return false if the clock didn't increase", () => {
  const oldWorkspaceIntegrityProof = createWorkspaceIntegrityProof({
    workspaceIntegrityData: {
      ...workspaceIntegrityData,
      clock: 1,
    },
    authorKeyPair,
  });

  const workspaceIntegrityProof = createWorkspaceIntegrityProof({
    workspaceIntegrityData,
    authorKeyPair,
  });

  const result = isValidWorkspaceIntegrityProof({
    workspaceIntegrityData,
    authorPublicKey,
    workspaceIntegrityProof: workspaceIntegrityProof,
    pastKnownWorkspaceIntegrityProof: oldWorkspaceIntegrityProof,
  });
  expect(result).toBe(false);
});
