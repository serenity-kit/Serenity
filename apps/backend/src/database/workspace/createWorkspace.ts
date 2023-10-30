import * as workspaceChain from "@serenity-kit/workspace-chain";
import { equalArrayContent, generateId } from "@serenity-tools/common";
import { Prisma } from "../../../prisma/generated/output";
import {
  Workspace,
  WorkspaceKey,
  WorkspaceKeyBox,
} from "../../types/workspace";
import { getOrCreateCreatorDevice } from "../../utils/device/getOrCreateCreatorDevice";
import { prisma } from "../prisma";

export type DeviceWorkspaceKeyBoxParams = {
  deviceSigningPublicKey: string;
  nonce: string;
  ciphertext: string;
};

type Params = {
  id: string;
  infoCiphertext: string;
  infoNonce: string;
  userId: string;
  creatorDeviceSigningPublicKey: string;
  deviceWorkspaceKeyBoxes: DeviceWorkspaceKeyBoxParams[];
  workspaceKeyId?: string | undefined;
  workspaceChainEvent: workspaceChain.CreateChainWorkspaceChainEvent;
};

export async function createWorkspace({
  id,
  infoCiphertext,
  infoNonce,
  userId,
  creatorDeviceSigningPublicKey,
  deviceWorkspaceKeyBoxes,
  workspaceKeyId,
  workspaceChainEvent,
}: Params): Promise<Workspace> {
  return await prisma.$transaction(
    async (prisma) => {
      const allDeviceSigningPublicKeys = deviceWorkspaceKeyBoxes.map(
        (workspaceKeyBox) => workspaceKeyBox.deviceSigningPublicKey
      );
      const devices = await prisma.device.findMany({
        where: {
          OR: [
            { userId, expiresAt: { gt: new Date() } },
            // main devices don't expire
            { userId, expiresAt: null },
          ],
        },
        select: { signingPublicKey: true },
      });

      const actualDeviceSigningPublicKeys = devices.map(
        (item) => item.signingPublicKey
      );
      if (
        !equalArrayContent(
          allDeviceSigningPublicKeys,
          actualDeviceSigningPublicKeys
        )
      ) {
        throw new Error(
          "Invalid deviceWorkspaceKeyBoxes since it doesn't match all devices of the user"
        );
      }

      const rawWorkspace = await prisma.workspace.create({
        data: {
          id,
          infoCiphertext,
          infoNonce,
          usersToWorkspaces: {
            create: {
              userId,
              role: "ADMIN",
              isAuthorizedMember: true,
            },
          },
          workspaceKeys: {
            create: {
              id: workspaceKeyId || generateId(), // TODO this should be done on the client
              generation: 0,
            },
          },
        },
        include: {
          infoWorkspaceKey: {
            include: {
              workspaceKeyBoxes: {
                where: {
                  deviceSigningPublicKey: creatorDeviceSigningPublicKey,
                },
                include: { creatorDevice: true },
              },
            },
          },
        },
      });

      await prisma.workspace.update({
        where: { id: rawWorkspace.id },
        data: { infoWorkspaceKeyId: workspaceKeyId },
      });

      const workspaceChainState = workspaceChain.resolveState([
        workspaceChainEvent,
      ]);

      await prisma.workspaceChainEvent.create({
        data: {
          content: workspaceChainEvent,
          state: workspaceChainState,
          workspaceId: rawWorkspace.id,
          position: 0,
        },
      });

      // make sure the user controls this creatorDevice
      const creatorDevice = await getOrCreateCreatorDevice({
        prisma,
        userId,
        signingPublicKey: creatorDeviceSigningPublicKey,
      });

      const currentWorkspaceKey = await prisma.workspaceKey.findFirst({
        where: {
          workspaceId: rawWorkspace.id,
        },
      });
      if (!currentWorkspaceKey) {
        throw new Error("Error fetching newly created WorkspaceKey");
      }
      const workspaceKeyBoxes: WorkspaceKeyBox[] = [];
      deviceWorkspaceKeyBoxes.forEach(
        (deviceWorkspaceKeyBox: DeviceWorkspaceKeyBoxParams) => {
          workspaceKeyBoxes.push({
            id: generateId(),
            workspaceKeyId: currentWorkspaceKey.id,
            ...deviceWorkspaceKeyBox,
            creatorDeviceSigningPublicKey: creatorDevice.signingPublicKey,
          });
        }
      );

      await prisma.workspaceKeyBox.createMany({
        data: workspaceKeyBoxes,
      });
      const createdWorkspaceKeyBoxes = await prisma.workspaceKeyBox.findMany({
        where: {
          workspaceKeyId: currentWorkspaceKey.id,
        },
        include: {
          creatorDevice: true,
        },
      });
      const returningWorkspaceKey: WorkspaceKey = {
        ...currentWorkspaceKey,
        workspaceKeyBox: createdWorkspaceKeyBoxes[0],
      };
      const workspace: Workspace = {
        id: rawWorkspace.id,
        infoCiphertext: rawWorkspace.infoCiphertext,
        infoNonce: rawWorkspace.infoNonce,
        infoWorkspaceKey: rawWorkspace.infoWorkspaceKey,
        currentWorkspaceKey: returningWorkspaceKey,
        workspaceKeys: [returningWorkspaceKey],
      };
      return workspace;
    },
    {
      isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
    }
  );
}
