import { createRootFoldersHash } from "./createRootFoldersHash";
import { isValidRootFoldersHash } from "./isValidRootFoldersHash";

test("should return true for a valid hash", () => {
  const result = createRootFoldersHash({
    clock: 0,
    rootFolderHashes: [],
  });
  expect(
    isValidRootFoldersHash({
      clock: 0,
      hash: result.hash,
      version: result.version,
      rootFolderHashes: [],
    })
  ).toEqual(true);
});

it("should return false for an invalid hash", () => {
  const result = createRootFoldersHash({
    clock: 0,
    rootFolderHashes: [],
  });
  const result2 = createRootFoldersHash({
    clock: 0,
    rootFolderHashes: ["abc"],
  });

  expect(
    isValidRootFoldersHash({
      clock: 0,
      hash: result2.hash,
      version: result.version,
      rootFolderHashes: [],
    })
  ).toEqual(false);
});

it("should return false for a different version number", () => {
  const result = createRootFoldersHash({
    clock: 0,
    rootFolderHashes: [],
  });

  expect(
    isValidRootFoldersHash({
      clock: 0,
      hash: result.hash,
      version: -1,
      rootFolderHashes: [],
    })
  ).toEqual(false);
});

it("should throw an error if the version number is higher than the current version", () => {
  const result = createRootFoldersHash({
    clock: 0,
    rootFolderHashes: [],
  });

  expect(() =>
    isValidRootFoldersHash({
      clock: 0,
      hash: result.hash,
      version: 1000,
      rootFolderHashes: [],
    })
  ).toThrow();
});
