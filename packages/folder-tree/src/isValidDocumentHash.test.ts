import { createDocumentHash } from "./createDocumentHash";
import { isValidDocumentHash } from "./isValidDocumentHash";

test("should return true for a valid hash", () => {
  const result = createDocumentHash({ documentId: "abc" });

  expect(
    isValidDocumentHash({
      hash: result.hash,
      version: result.version,
      documentId: "abc",
    })
  ).toEqual(true);
});

test("should return false for an invalid hash", () => {
  const result = createDocumentHash({ documentId: "abc" });
  const result2 = createDocumentHash({ documentId: "cde" });

  expect(
    isValidDocumentHash({
      hash: result2.hash,
      version: result.version,
      documentId: "abc",
    })
  ).toEqual(false);
});

test("should return false for a different version number", () => {
  const result = createDocumentHash({ documentId: "abc" });

  expect(
    isValidDocumentHash({
      hash: result.hash,
      version: -1,
      documentId: "abc",
    })
  ).toEqual(false);
});

test("should throw an error if the version number is higher than the current version", () => {
  const result = createDocumentHash({ documentId: "abc" });

  expect(() =>
    isValidDocumentHash({
      hash: result.hash,
      version: 1000,
      documentId: "abc",
    })
  ).toThrow();
});

test("should throw an error if the documentId can't be canonicalized", () => {
  expect(() =>
    isValidDocumentHash({
      hash: "abc",
      version: 0,
      // @ts-expect-error
      documentId: NaN,
    })
  ).toThrow();
});
