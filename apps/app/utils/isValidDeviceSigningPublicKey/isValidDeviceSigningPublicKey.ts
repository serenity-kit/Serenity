import { Role } from "@serenity-kit/workspace-chain";
import { getLocalOrLoadRemoteUserByUserChainHash } from "../../store/userStore";
import { getLocalOrLoadRemoteWorkspaceChainEntryByHash } from "../../store/workspaceChainStore";
import { WorkspaceMemberDevicesProofLocalDbEntry } from "../../store/workspaceMemberDevicesProofStore";

type Params = {
  workspaceId: string;
  workspaceMemberDevicesProofEntry: WorkspaceMemberDevicesProofLocalDbEntry;
  signingPublicKey: string;
  minimumRole: Role;
};

export const isValidDeviceSigningPublicKey = async ({
  workspaceMemberDevicesProofEntry,
  workspaceId,
  signingPublicKey,
  minimumRole,
}: Params) => {
  const workspaceChainEntry =
    await getLocalOrLoadRemoteWorkspaceChainEntryByHash({
      hash: workspaceMemberDevicesProofEntry.data.workspaceChainHash,
      workspaceId,
    });

  if (!workspaceChainEntry) {
    return false;
  }

  for (const [userId, userChainHash] of Object.entries(
    workspaceMemberDevicesProofEntry.data.userChainHashes
  )) {
    const user = await getLocalOrLoadRemoteUserByUserChainHash({
      userChainHash,
      userId,
      workspaceId,
    });

    if (user && Object.keys(user.devices).includes(signingPublicKey)) {
      const role =
        workspaceChainEntry.state.members[user.mainDeviceSigningPublicKey].role;
      if (minimumRole === "ADMIN" && role === "ADMIN") {
        return true;
      } else if (
        minimumRole === "EDITOR" &&
        (role === "ADMIN" || role === "EDITOR")
      ) {
        return true;
      } else if (
        minimumRole === "COMMENTER" &&
        (role === "ADMIN" || role === "EDITOR" || role === "COMMENTER")
      ) {
        return true;
      }
      return false;
    }
  }

  return false;
};
