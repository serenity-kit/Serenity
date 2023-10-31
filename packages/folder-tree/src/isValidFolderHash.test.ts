import { createFolderHash } from "./createFolderHash";
import { isValidFolderHash } from "./isValidFolderHash";

test("should return true for a valid hash", () => {
  const result = createFolderHash({
    clock: 0,
    folderId: "abc",
    nameCiphertext: "abc",
    nameNonce: "abc",
    subDocumentHashes: [],
    subFolderHashes: [],
  });
  expect(
    isValidFolderHash({
      clock: 0,
      hash: result.hash,
      version: result.version,
      folderId: "abc",
      nameCiphertext: "abc",
      nameNonce: "abc",
      subDocumentHashes: [],
      subFolderHashes: [],
    })
  ).toEqual(true);
});

it("should return false for an invalid hash", () => {
  const result = createFolderHash({
    clock: 0,
    folderId: "abc",
    nameCiphertext: "abc",
    nameNonce: "abc",
    subDocumentHashes: [],
    subFolderHashes: [],
  });
  const result2 = createFolderHash({
    clock: 0,
    folderId: "cde",
    nameCiphertext: "abc",
    nameNonce: "abc",
    subDocumentHashes: [],
    subFolderHashes: [],
  });

  expect(
    isValidFolderHash({
      clock: 0,
      hash: result2.hash,
      version: result.version,
      folderId: "abc",
      nameCiphertext: "abc",
      nameNonce: "abc",
      subDocumentHashes: [],
      subFolderHashes: [],
    })
  ).toEqual(false);
});

it("should return false for a different version number", () => {
  const result = createFolderHash({
    clock: 0,
    folderId: "abc",
    nameCiphertext: "abc",
    nameNonce: "abc",
    subDocumentHashes: [],
    subFolderHashes: [],
  });

  expect(
    isValidFolderHash({
      clock: 0,
      hash: result.hash,
      version: -1,
      folderId: "abc",
      nameCiphertext: "abc",
      nameNonce: "abc",
      subDocumentHashes: [],
      subFolderHashes: [],
    })
  ).toEqual(false);
});

it("should throw an error if the version number is higher than the current version", () => {
  const result = createFolderHash({
    clock: 0,
    folderId: "abc",
    nameCiphertext: "abc",
    nameNonce: "abc",
    subDocumentHashes: [],
    subFolderHashes: [],
  });

  expect(() =>
    isValidFolderHash({
      clock: 0,
      hash: result.hash,
      version: 1000,
      folderId: "abc",
      nameCiphertext: "abc",
      nameNonce: "abc",
      subDocumentHashes: [],
      subFolderHashes: [],
    })
  ).toThrow();
});

it("should throw an error if the folderId can't be canonicalized", () => {
  expect(() =>
    isValidFolderHash({
      clock: 0,
      hash: "abc",
      version: 0,
      // @ts-expect-error
      folderId: NaN,
      nameCiphertext: "abc",
      nameNonce: "abc",
      subDocumentHashes: [],
      subFolderHashes: [],
    })
  ).toThrow();
});

it("should throw an error if the nameCiphertext can't be canonicalized", () => {
  expect(() =>
    isValidFolderHash({
      clock: 0,
      hash: "abc",
      version: 0,
      folderId: "abc",
      // @ts-expect-error
      nameCiphertext: NaN,
      nameNonce: "abc",
      subDocumentHashes: [],
      subFolderHashes: [],
    })
  ).toThrow();
});
