import {
  CreatorDevice as PrismaCreatorDevice,
  Workspace as PrismaWorkspace,
  WorkspaceKey as PrismaWorkspaceKey,
  WorkspaceKeyBox as PrismaWorkspaceKeyBox,
  Role,
} from "../../prisma/generated/output";
import { CreatorDevice } from "./device";

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

type ChainEntry = {
  serializedContent: string;
  position: number;
};

export type WorkspaceMember = {
  id: string;
  user: {
    id: string;
    username: string;
    chain: ChainEntry[];
  };
};

export type Workspace = {
  id: string;
  infoCiphertext: string | undefined | null;
  infoNonce: string | undefined | null;
  infoWorkspaceKeyId?: string | undefined | null;
  infoWorkspaceKey?: WorkspaceKey | undefined | null;
  infoSignature: string;
  infoWorkspaceMemberDevicesProofHash: string;
  infoCreatorDeviceSigningPublicKey: string;
  workspaceKeys?: WorkspaceKey[];
  currentWorkspaceKey?: WorkspaceKey;
  chain?: ChainEntry[];
};

export type WorkspaceInvitation = {
  id: string;
  workspaceId: string;
  inviterUserId: string;
  inviterUsername: string;
  invitationSigningPublicKey: string;
  invitationDataSignature: string;
  expiresAt: Date;
};

type DbUser = {
  id: string;
  username: string;
  chain: { content: any; position: number }[];
};

type DbWorkspace = PrismaWorkspace & {
  workspaceKeys?: (PrismaWorkspaceKey & {
    workspaceKeyBoxes: (PrismaWorkspaceKeyBox & {
      creatorDevice: PrismaCreatorDevice;
    })[];
  })[];
  infoWorkspaceKey?:
    | (PrismaWorkspaceKey & {
        workspaceKeyBoxes: (PrismaWorkspaceKeyBox & {
          creatorDevice: PrismaCreatorDevice;
        })[];
      })
    | undefined
    | null;

  chain?: { content: any; position: number }[];
};

export const formatWorkspaceKey = (workspaceKey: any): WorkspaceKey => {
  if (workspaceKey.workspaceKeyBoxes) {
    workspaceKey.workspaceKeyBox = workspaceKey.workspaceKeyBoxes[0];
  }
  return workspaceKey;
};

export const formatWorkspaceInvitation = (workspaceInvitation: any) => {
  return {
    ...workspaceInvitation,
    role: workspaceInvitation.role as Role,
  };
};

export const formatWorkspaceMember = (
  user: DbUser,
  workspaceId: string
): WorkspaceMember => {
  if (!user.chain) {
    throw new Error("Missing chain for user");
  }
  const workspaceMember: WorkspaceMember = {
    id: `workspace:${workspaceId}-user:${user.id}`,
    user: {
      ...user,
      chain: user.chain.map((userChainEvent) => {
        return {
          serializedContent: JSON.stringify(userChainEvent.content),
          position: userChainEvent.position,
        };
      }),
    },
  };
  return workspaceMember;
};

export const formatWorkspace = (workspace: DbWorkspace): Workspace => {
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
  const infoWorkspaceKey: WorkspaceKey | undefined | null =
    workspace.infoWorkspaceKey;
  if (infoWorkspaceKey?.workspaceKeyBoxes) {
    infoWorkspaceKey.workspaceKeyBox = infoWorkspaceKey.workspaceKeyBoxes[0];
  }
  return {
    ...workspace,
    currentWorkspaceKey,
    infoWorkspaceKey,
    workspaceKeys,
    chain: workspace.chain?.map((entry) => {
      return {
        serializedContent: JSON.stringify(entry.content),
        position: entry.position,
      };
    }),
  };
};
