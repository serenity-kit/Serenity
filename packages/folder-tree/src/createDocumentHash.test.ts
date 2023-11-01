import { createDocumentHash } from "./createDocumentHash";

test("should return a hash for a given documentId", () => {
  const result = createDocumentHash({
    documentId: "abc",
    documentChainEventHash: "def",
  });
  expect(result.hash).toEqual("UpbqSe7w2kjAfJoc0NBee-UNunXpFPW_7NwTTF02bds");
  expect(result.version).toEqual(0);
});

test("should return the same hash for the same documentId", () => {
  const result = createDocumentHash({
    documentId: "abc",
    documentChainEventHash: "def",
  });
  const result2 = createDocumentHash({
    documentId: "abc",
    documentChainEventHash: "def",
  });
  expect(result.hash).toEqual(result2.hash);
});

test("should return a different hash for a different documentId", () => {
  const result = createDocumentHash({
    documentId: "abc",
    documentChainEventHash: "def",
  });
  const result2 = createDocumentHash({
    documentId: "def",
    documentChainEventHash: "def",
  });
  expect(result.hash).not.toEqual(result2.hash);
});

test("should throw an error if the documentId can't be canonicalized", () => {
  // @ts-expect-error
  expect(() => createDocumentHash({ documentId: NaN })).toThrow();
});
