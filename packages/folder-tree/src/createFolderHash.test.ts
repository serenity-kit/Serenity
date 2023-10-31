import { createFolderHash } from "./createFolderHash";

test("should return a hash for a folder", () => {
  const result = createFolderHash({
    clock: 0,
    folderId: "abc",
    nameCiphertext: "abc",
    nameNonce: "abc",
    subDocumentHashes: [],
    subFolderHashes: [],
  });
  expect(result.hash).toEqual("7BJrq01L5YUcandUz2sUngzWyz2P4KSAls8L7Q9h2wg");
  expect(result.version).toEqual(0);
});

test("should return the same hash if the subDocumentHashes are in a different order", () => {
  const result = createFolderHash({
    clock: 0,
    folderId: "abc",
    nameCiphertext: "abc",
    nameNonce: "abc",
    subDocumentHashes: ["abc", "def"],
    subFolderHashes: [],
  });

  const result2 = createFolderHash({
    clock: 0,
    folderId: "abc",
    nameCiphertext: "abc",
    nameNonce: "abc",
    subDocumentHashes: ["def", "abc"],
    subFolderHashes: [],
  });

  expect(result.hash).toEqual(result2.hash);
});

test("should return the same hash if the subFolderHashes are in a different order", () => {
  const result = createFolderHash({
    clock: 0,
    folderId: "abc",
    nameCiphertext: "abc",
    nameNonce: "abc",
    subDocumentHashes: [],
    subFolderHashes: ["abc", "def"],
  });

  const result2 = createFolderHash({
    clock: 0,
    folderId: "abc",
    nameCiphertext: "abc",
    nameNonce: "abc",
    subDocumentHashes: [],
    subFolderHashes: ["def", "abc"],
  });

  expect(result.hash).toEqual(result2.hash);
});
