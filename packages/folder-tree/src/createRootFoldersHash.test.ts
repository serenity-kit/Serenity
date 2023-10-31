import { createRootFoldersHash } from "./createRootFoldersHash";

test("should return a hash for a folder", () => {
  const result = createRootFoldersHash({
    clock: 0,
    rootFolderHashes: [],
  });
  expect(result.hash).toEqual("92wSwQbZ52scOA4XVJYQGSXFcMVnNnS6aFdyPbndE9c");
  expect(result.version).toEqual(0);
});

test("should return the same hash if the rootFolderHashes are in a different order", () => {
  const result = createRootFoldersHash({
    clock: 0,
    rootFolderHashes: ["abc", "def"],
  });

  const result2 = createRootFoldersHash({
    clock: 0,
    rootFolderHashes: ["def", "abc"],
  });

  expect(result.hash).toEqual(result2.hash);
});
