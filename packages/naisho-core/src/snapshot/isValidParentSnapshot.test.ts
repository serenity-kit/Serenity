import { isValidParentSnapshot } from "./isValidParentSnapshot";

const grandParentSnapshotProof = new Uint8Array([1, 2, 3]);
const parentSnapshotCiphertext = new Uint8Array([4, 5, 6]);
const parentSnapshotProof = "IqymLW_N-uB6RSBsmakWUVgMZEwg5EZhd3bSnK59Wq8";

test("it returns true for a valid proof", () => {
  const isValid = isValidParentSnapshot({
    grandParentSnapshotProof,
    parentSnapshotCiphertext,
    snapshot: {
      nonce: "nonce",
      ciphertext: "ciphertext",
      publicData: {
        parentSnapshotProof,
        docId: "docId",
        subkeyId: 1,
        snapshotId: "snapshotId",
        pubKey: "pubKey",
        keyDerivationTrace: {
          workspaceKeyId: "workspaceKeyId",
          trace: [],
        },
      },
      signature: "signature",
    },
  });
  expect(isValid).toBe(true);
});

test("it returns false to due a changed parentSnapshotCiphertext", () => {
  const isValid = isValidParentSnapshot({
    grandParentSnapshotProof,
    parentSnapshotCiphertext: new Uint8Array([4, 5, 7]),
    snapshot: {
      nonce: "nonce",
      ciphertext: "ciphertext",
      publicData: {
        parentSnapshotProof,
        docId: "docId",
        subkeyId: 1,
        snapshotId: "snapshotId",
        pubKey: "pubKey",
        keyDerivationTrace: {
          workspaceKeyId: "workspaceKeyId",
          trace: [],
        },
      },
      signature: "signature",
    },
  });
  expect(isValid).toBe(false);
});

test("it returns false to due a changed grandParentSnapshotProof", () => {
  const isValid = isValidParentSnapshot({
    grandParentSnapshotProof: new Uint8Array([1, 2, 4]),
    parentSnapshotCiphertext,
    snapshot: {
      nonce: "nonce",
      ciphertext: "ciphertext",
      publicData: {
        parentSnapshotProof,
        docId: "docId",
        subkeyId: 1,
        snapshotId: "snapshotId",
        pubKey: "pubKey",
        keyDerivationTrace: {
          workspaceKeyId: "workspaceKeyId",
          trace: [],
        },
      },
      signature: "signature",
    },
  });
  expect(isValid).toBe(false);
});

test("it returns false if parentSnapshotCiphertext and grandParentSnapshotProof are flipped", () => {
  const isValid = isValidParentSnapshot({
    grandParentSnapshotProof: parentSnapshotCiphertext,
    parentSnapshotCiphertext: grandParentSnapshotProof,
    snapshot: {
      nonce: "nonce",
      ciphertext: "ciphertext",
      publicData: {
        parentSnapshotProof,
        docId: "docId",
        subkeyId: 1,
        snapshotId: "snapshotId",
        pubKey: "pubKey",
        keyDerivationTrace: {
          workspaceKeyId: "workspaceKeyId",
          trace: [],
        },
      },
      signature: "signature",
    },
  });
  expect(isValid).toBe(false);
});

test("it returns false to due a manipulated parentSnapshotProof", () => {
  const isValid = isValidParentSnapshot({
    grandParentSnapshotProof: new Uint8Array([1, 2, 4]),
    parentSnapshotCiphertext,
    snapshot: {
      nonce: "nonce",
      ciphertext: "ciphertext",
      publicData: {
        parentSnapshotProof: "WRONG",
        docId: "docId",
        subkeyId: 1,
        snapshotId: "snapshotId",
        pubKey: "pubKey",
        keyDerivationTrace: {
          workspaceKeyId: "workspaceKeyId",
          trace: [],
        },
      },
      signature: "signature",
    },
  });
  expect(isValid).toBe(false);
});
