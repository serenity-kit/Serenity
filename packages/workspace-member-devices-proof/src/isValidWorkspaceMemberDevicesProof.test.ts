import sodium from "react-native-libsodium";
import { createWorkspaceMemberDevicesProof } from "./createWorkspaceMemberDevicesProof";
import { isValidWorkspaceMemberDevicesProof } from "./isValidWorkspaceMemberDevicesProof";
import {
  WorkspaceMemberDevicesProof,
  WorkspaceMemberDevicesProofData,
} from "./types";

const mockedVersionGetter = jest.fn();

jest.mock("./constants", () => {
  const originalModule = jest.requireActual("./constants");
  return {
    get version() {
      return mockedVersionGetter();
    },
    workspaceMemberDevicesProofDomainContext:
      originalModule.workspaceMemberDevicesProofDomainContext,
  };
});

let authorKeyPair: sodium.KeyPair;
let authorPublicKey: string;
let workspaceMemberDevicesProof: WorkspaceMemberDevicesProof;
let workspaceMemberDevicesProofData: WorkspaceMemberDevicesProofData;

beforeEach(async () => {
  await sodium.ready;
  authorKeyPair = sodium.crypto_sign_keypair();
  authorPublicKey = sodium.to_base64(authorKeyPair.publicKey);
});

beforeEach(() => {
  mockedVersionGetter.mockReturnValue(0);

  workspaceMemberDevicesProofData = {
    clock: 0,
    workspaceChainHash: "testChainHash",
    userChainHashes: { userId: "testUserHash", userId2: "testUserHash2" },
  };

  workspaceMemberDevicesProof = createWorkspaceMemberDevicesProof({
    workspaceMemberDevicesProofData,
    authorKeyPair,
  });
});

it("should return true for a valid proof", () => {
  const result = isValidWorkspaceMemberDevicesProof({
    workspaceMemberDevicesProofData,
    authorPublicKey,
    workspaceMemberDevicesProof,
  });
  expect(result).toBe(true);
});

it("should return true for a valid with with pastKnownWorkspaceMemberDevicesProof provided", () => {
  const workspaceMemberDevicesProof = createWorkspaceMemberDevicesProof({
    workspaceMemberDevicesProofData,
    authorKeyPair,
  });

  const newWorkspaceMemberDevicesProof = createWorkspaceMemberDevicesProof({
    workspaceMemberDevicesProofData: {
      ...workspaceMemberDevicesProofData,
      clock: 1,
    },
    authorKeyPair,
  });

  const result = isValidWorkspaceMemberDevicesProof({
    workspaceMemberDevicesProofData: {
      ...workspaceMemberDevicesProofData,
      clock: 1,
    },
    authorPublicKey,
    workspaceMemberDevicesProof: newWorkspaceMemberDevicesProof,
    pastKnownWorkspaceMemberDevicesProof: workspaceMemberDevicesProof,
  });
  expect(result).toBe(true);
});

it("should return false for an invalid hash", () => {
  const result = isValidWorkspaceMemberDevicesProof({
    workspaceMemberDevicesProofData,
    authorPublicKey,
    workspaceMemberDevicesProof: {
      ...workspaceMemberDevicesProof,
      hash: "invalidHash",
    },
  });
  expect(result).toBe(false);
});

it("should return false for an invalid signature", () => {
  const result = isValidWorkspaceMemberDevicesProof({
    workspaceMemberDevicesProofData,
    authorPublicKey,
    workspaceMemberDevicesProof: {
      ...workspaceMemberDevicesProof,
      hashSignature: "invalidSignature",
    },
  });
  expect(result).toBe(false);
});

it("should return false if canonicalization fails for workspaceData", () => {
  const result = isValidWorkspaceMemberDevicesProof({
    workspaceMemberDevicesProofData: {
      ...workspaceMemberDevicesProofData,
      // @ts-expect-error NaN is not allowed in canonicalize
      workspaceInfoCiphertext: NaN,
    },
    authorPublicKey,
    workspaceMemberDevicesProof,
  });
  expect(result).toBe(false);
});

it("should return false if the version is larger than the current's client version", () => {
  mockedVersionGetter.mockReturnValue(100);

  workspaceMemberDevicesProof = createWorkspaceMemberDevicesProof({
    workspaceMemberDevicesProofData,
    authorKeyPair,
  });

  mockedVersionGetter.mockReturnValue(0);

  const result = isValidWorkspaceMemberDevicesProof({
    workspaceMemberDevicesProofData,
    authorPublicKey,
    workspaceMemberDevicesProof,
  });
  expect(result).toBe(false);
});

it("should return false if the clock didn't increase", () => {
  const oldWorkspaceMemberDevicesProof = createWorkspaceMemberDevicesProof({
    workspaceMemberDevicesProofData: {
      ...workspaceMemberDevicesProofData,
      clock: 1,
    },
    authorKeyPair,
  });

  const workspaceMemberDevicesProof = createWorkspaceMemberDevicesProof({
    workspaceMemberDevicesProofData,
    authorKeyPair,
  });

  const result = isValidWorkspaceMemberDevicesProof({
    workspaceMemberDevicesProofData,
    authorPublicKey,
    workspaceMemberDevicesProof: workspaceMemberDevicesProof,
    pastKnownWorkspaceMemberDevicesProof: oldWorkspaceMemberDevicesProof,
  });
  expect(result).toBe(false);
});
