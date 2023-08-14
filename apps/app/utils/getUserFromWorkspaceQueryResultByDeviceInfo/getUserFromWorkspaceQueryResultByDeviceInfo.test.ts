import { getUserFromWorkspaceQueryResultByDeviceInfo } from "./getUserFromWorkspaceQueryResultByDeviceInfo";

const workspaceQueryResult = {
  workspace: {
    members: [
      { user: { id: "1" }, devices: [{ signingPublicKey: "xyz" }] },
      { user: { id: "2" }, devices: [{ signingPublicKey: "abc" }] },
      { user: { id: "3" }, devices: [{ signingPublicKey: "def" }] },
    ],
  },
};

test("should return undefined if workspaceQueryResult has no members", () => {
  const result = getUserFromWorkspaceQueryResultByDeviceInfo(
    // @ts-expect-error
    { workspace: { members: [] } },
    { signingPublicKey: "abc" }
  );
  expect(result).toBeUndefined();
});

test("should return undefined if device is not found in any member", () => {
  const result = getUserFromWorkspaceQueryResultByDeviceInfo(
    // @ts-expect-error
    workspaceQueryResult,
    { signingPublicKey: "nothing" }
  );
  expect(result).toBeUndefined();
});

test("should return the member that contains the device", () => {
  const result = getUserFromWorkspaceQueryResultByDeviceInfo(
    // @ts-expect-error
    workspaceQueryResult,
    { signingPublicKey: "abc" }
  );
  expect(result?.user.id).toBe("2");
});
