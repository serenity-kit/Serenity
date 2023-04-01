import { createParentSnapshotProof } from "./createParentSnapshotProof";

const grandParentSnapshotProof = new Uint8Array([1, 2, 3]);
const parentSnapshotCiphertext = new Uint8Array([4, 5, 6]);

test("it returns a valid proof", () => {
  const parentSnapshotProof = createParentSnapshotProof({
    grandParentSnapshotProof,
    parentSnapshotCiphertext,
  });

  expect(parentSnapshotProof).toEqual(
    "IqymLW_N-uB6RSBsmakWUVgMZEwg5EZhd3bSnK59Wq8"
  );
});
