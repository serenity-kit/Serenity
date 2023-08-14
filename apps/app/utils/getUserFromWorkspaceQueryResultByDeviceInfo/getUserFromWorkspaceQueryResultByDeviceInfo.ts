import {
  MinimalDevice,
  WorkspaceMember,
  WorkspaceQuery,
} from "../../generated/graphql";

export const getUserFromWorkspaceQueryResultByDeviceInfo = (
  workspaceQueryResult: WorkspaceQuery,
  device: { signingPublicKey: MinimalDevice["signingPublicKey"] }
) => {
  let member: WorkspaceMember | undefined;
  if (workspaceQueryResult.workspace?.members) {
    // @ts-expect-error - TODO we should use a user verified by a
    // a userChain here
    member = workspaceQueryResult.workspace.members.find((member) => {
      if (!member.devices) {
        return false;
      }
      return member.devices.some((memberDevice) => {
        return memberDevice.signingPublicKey === device.signingPublicKey;
      });
    });
  }
  return member;
};
