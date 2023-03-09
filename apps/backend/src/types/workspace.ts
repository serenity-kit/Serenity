import {
  CreatorDevice as PrismaCreatorDevice,
  Role,
  UsersToWorkspaces,
  Workspace as PrismaWorkspace,
  WorkspaceKey as PrismaWorkspaceKey,
  WorkspaceKeyBox as PrismaWorkspaceKeyBox,
} from "../../prisma/generated/output";
import { CreatorDevice, Device, MinimalDevice } from "./device";

export type MemberIdWithDevice = {
  id: string;
  devices: Device[];
};

export type WorkspaceIdWithMemberDevices = {
  id: string;
  members: MemberIdWithDevice[];
};

export type WorkspaceKeyBox = {
  id: string;
  workspaceKeyId: string;
  deviceSigningPublicKey: string;
  creatorDeviceSigningPublicKey: string;
  nonce: string;
  ciphertext: string;
  creatorDevice?: CreatorDevice | null | undefined;
};

export type WorkspaceKey = {
  id: string;
  workspaceId: string;
  generation: number;
  workspaceKeyBox?: WorkspaceKeyBox;
  workspaceKeyBoxes?: WorkspaceKeyBox[];
};

export type WorkspaceMember = {
  userId: string;
  username: string | undefined | null;
  role: Role;
  devices: MinimalDevice[];
};

export type Workspace = {
  id: string;
  idSignature: string;
  name?: string | undefined | null;
  infoCiphertext?: string | undefined | null;
  infoNonce?: string | undefined | null;
  infoWorkspaceKeyId?: string | undefined | null;
  infoWorkspaceKey?: WorkspaceKey | undefined | null;
  members: WorkspaceMember[];
  workspaceKeys?: WorkspaceKey[];
  currentWorkspaceKey?: WorkspaceKey;
};

export type WorkspaceInvitation = {
  id: string;
  workspaceId: string;
  inviterUserId: string;
  inviterUsername: string;
  invitationSigningPublicKey: string;
  invitationDataSignature: string;
  workspaceName: string | undefined;
  expiresAt: Date;
};

type DbWorkspace = PrismaWorkspace & {
  usersToWorkspaces: (UsersToWorkspaces & {
    user: {
      username: string;
      devices: {
        signingPublicKey: string;
        encryptionPublicKey: string;
        encryptionPublicKeySignature: string;
      }[];
    };
  })[];
  workspaceKeys?: (PrismaWorkspaceKey & {
    workspaceKeyBoxes: (PrismaWorkspaceKeyBox & {
      creatorDevice: PrismaCreatorDevice;
    })[];
  })[];
};

export const formatWorkspaceKey = (workspaceKey: any): WorkspaceKey => {
  if (workspaceKey.workspaceKeyBoxes) {
    workspaceKey.workspaceKeyBox = workspaceKey.workspaceKeyBoxes[0];
  }
  return workspaceKey;
};

export const formatWorkspace = (workspace: DbWorkspace): Workspace => {
  const members: WorkspaceMember[] = [];
  workspace.usersToWorkspaces.forEach((member) => {
    const workspaceMember: WorkspaceMember = {
      userId: member.userId,
      username: member.user.username,
      role: member.role,
      devices: member.user.devices,
    };
    members.push(workspaceMember);
  });
  let currentWorkspaceKey: WorkspaceKey | undefined = undefined;
  const workspaceKeys: WorkspaceKey[] = [];
  if (workspace.workspaceKeys) {
    for (let workspaceKey of workspace.workspaceKeys) {
      const workspaceKeyWithworkspaceKeyBox = {
        ...workspaceKey,
        workspaceKeyBox:
          workspaceKey.workspaceKeyBoxes?.length > 0
            ? workspaceKey.workspaceKeyBoxes[0]
            : undefined,
      };
      if (!currentWorkspaceKey) {
        currentWorkspaceKey = workspaceKeyWithworkspaceKeyBox;
      }

      workspaceKeys.push(workspaceKeyWithworkspaceKeyBox);
    }
  }
  return {
    ...workspace,
    members: members,
    currentWorkspaceKey: currentWorkspaceKey,
    workspaceKeys,
  };
};
