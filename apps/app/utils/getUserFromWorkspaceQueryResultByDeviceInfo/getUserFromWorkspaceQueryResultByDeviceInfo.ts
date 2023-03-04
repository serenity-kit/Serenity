import {
  MinimalDevice,
  WorkspaceMember,
  WorkspaceQuery,
} from "../../generated/graphql";

export const getUserFromWorkspaceQueryResultByDeviceInfo = (
  workspaceQueryResult: WorkspaceQuery,
  device: MinimalDevice
) => {
  let user: WorkspaceMember | undefined;
  if (workspaceQueryResult.workspace?.members) {
    user = workspaceQueryResult.workspace.members.find((member) => {
      if (!member.devices) {
        return false;
      }
      return member.devices.some((memberDevice) => {
        console.log(memberDevice, device);
        return memberDevice.signingPublicKey === device.signingPublicKey;
      });
    });
  }
  return user;
};
