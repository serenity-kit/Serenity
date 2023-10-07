import { ForbiddenError } from "apollo-server-express";
import { Prisma } from "../../../prisma/generated/output";
import { WorkspaceKeyBox } from "../../types/workspace";
import { WorkspaceDeviceParing } from "../../types/workspaceDevice";
import { getOrCreateCreatorDevice } from "../../utils/device/getOrCreateCreatorDevice";
import { prisma } from "../prisma";

type WorkspaceKeyInput = {
  workspaceKeyId: string;
  workspaceKeyBoxes: WorkspaceDeviceParing[];
};

const equalSet = (setA, setB) =>
  setA.size === setB.size && [...setA].every((x) => setB.has(x));

export type Params = {
  userId: string;
  workspaceId: string;
  creatorDeviceSigningPublicKey: string;
  workspaceKeys: WorkspaceKeyInput[];
};

export async function authorizeMember({
  userId,
  workspaceId,
  creatorDeviceSigningPublicKey,
  workspaceKeys,
}: Params): Promise<void> {
  return await prisma.$transaction(
    async (prisma) => {
      const userToWorkspace = await prisma.usersToWorkspaces.findFirst({
        where: { userId, workspaceId },
      });
      if (!userToWorkspace) {
        throw new ForbiddenError("Unauthorized");
      }
      if (
        workspaceKeys.length === 0 ||
        workspaceKeys[0].workspaceKeyBoxes.length === 0
      ) {
        throw new Error("No workspaceKeys");
      }

      const user = await prisma.user.findFirstOrThrow({
        where: {
          devices: {
            some: {
              signingPublicKey:
                workspaceKeys[0].workspaceKeyBoxes[0]
                  .receiverDeviceSigningPublicKey,
            },
          },
        },
        include: { devices: true },
      });
      const userDeviceSigningPublicKeysSet = new Set(
        user.devices.map((device) => device.signingPublicKey)
      );

      // check that every workspaceKey is encrypted for every device connected to the user
      workspaceKeys.forEach((entry) => {
        const deviceSigningPublicKeysSet = new Set(
          entry.workspaceKeyBoxes.map(
            (device) => device.receiverDeviceSigningPublicKey
          )
        );
        if (
          !equalSet(userDeviceSigningPublicKeysSet, deviceSigningPublicKeysSet)
        ) {
          throw new Error(`Device is missing`);
        }
      });

      // check that every workspaceKey is covered
      const workspaceKeysFromDb = await prisma.workspaceKey.findMany({
        where: { workspaceId },
      });
      const workspaceKeysFromDbIdsSet = new Set(
        workspaceKeysFromDb.map((key) => key.id)
      );
      const workspaceKeysIdsSet = new Set(
        workspaceKeys.map((key) => key.workspaceKeyId)
      );
      if (!equalSet(workspaceKeysFromDbIdsSet, workspaceKeysIdsSet)) {
        throw new Error(
          `WorkspaceKey is missing ${workspaceKeysFromDbIdsSet} ${workspaceKeysIdsSet}`
        );
      }

      // create a new, permanent "creator device" if one doesn't exist
      await getOrCreateCreatorDevice({
        prisma,
        userId,
        signingPublicKey: creatorDeviceSigningPublicKey,
      });

      const newWorkspaceKeyBoxes: Omit<WorkspaceKeyBox, "id">[] = [];
      workspaceKeys.forEach(({ workspaceKeyId, workspaceKeyBoxes }) => {
        workspaceKeyBoxes.forEach(
          ({ ciphertext, nonce, receiverDeviceSigningPublicKey }) => {
            newWorkspaceKeyBoxes.push({
              ciphertext,
              creatorDeviceSigningPublicKey,
              deviceSigningPublicKey: receiverDeviceSigningPublicKey,
              nonce,
              workspaceKeyId,
            });
          }
        );
      });

      await prisma.workspaceKeyBox.createMany({
        data: newWorkspaceKeyBoxes,
      });

      await prisma.usersToWorkspaces.update({
        data: { isAuthorizedMember: true },
        where: {
          userId_workspaceId: {
            workspaceId,
            userId: user.id,
          },
        },
      });
    },
    {
      isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
    }
  );
}
