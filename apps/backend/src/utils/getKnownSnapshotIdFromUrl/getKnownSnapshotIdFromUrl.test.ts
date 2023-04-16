import { getKnownSnapshotIdFromUrl } from "./getKnownSnapshotIdFromUrl";

test("returns undefined for undefined input", () => {
  expect(getKnownSnapshotIdFromUrl()).toBeUndefined();
});

test("returns undefined for an empty string", () => {
  expect(getKnownSnapshotIdFromUrl("")).toBeUndefined();
});

test("returns undefined for a string without a query parameter", () => {
  expect(getKnownSnapshotIdFromUrl("abc")).toBeUndefined();
  expect(getKnownSnapshotIdFromUrl("knownSnapshotId=abc")).toBeUndefined();
});

test("returns undefined in case the knownSnapshotId is now query param", () => {
  expect(getKnownSnapshotIdFromUrl("?lala=abc")).toBeUndefined();
});

test("returns the value for the knownSnapshotId query param", () => {
  expect(getKnownSnapshotIdFromUrl("path?knownSnapshotId=abc")).toBe("abc");
  expect(getKnownSnapshotIdFromUrl("path?lala=hmmm&knownSnapshotId=abc")).toBe(
    "abc"
  );
});
