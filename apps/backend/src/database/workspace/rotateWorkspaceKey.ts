import { generateId } from "@serenity-tools/common";
import { ForbiddenError, UserInputError } from "apollo-server-express";
import { Prisma, Role } from "../../../prisma/generated/output";
import { WorkspaceKey, WorkspaceKeyBox } from "../../types/workspace";
import { WorkspaceDeviceParing } from "../../types/workspaceDevice";
import { getOrCreateCreatorDevice } from "../../utils/device/getOrCreateCreatorDevice";

export type Props = {
  prisma: Prisma.TransactionClient;
  deviceWorkspaceKeyBoxes: WorkspaceDeviceParing[];
  creatorDeviceSigningPublicKey: string;
  workspaceId: string;
  userId: string;
};
export const rotateWorkspaceKey = async ({
  prisma,
  deviceWorkspaceKeyBoxes,
  creatorDeviceSigningPublicKey,
  workspaceId,
  userId,
}: Props) => {
  // verify that the user belongs to these workspaces
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });
  if (!user) {
    throw new ForbiddenError("Unauthorized");
  }
  const verifedUserWorkspace = await prisma.usersToWorkspaces.findMany({
    where: {
      userId,
      role: Role.ADMIN,
      isAuthorizedMember: true,
      workspaceId,
    },
    select: { workspaceId: true },
  });
  if (!verifedUserWorkspace) {
    throw new ForbiddenError("Unauthorized");
  }

  // make sure the user controls this creatorDevice
  const creatorDevice = await getOrCreateCreatorDevice({
    prisma,
    userId,
    signingPublicKey: creatorDeviceSigningPublicKey,
  });

  // make sure the user is including their mainDevice!
  // TODO: make sure the user includes their recovery device if it exists
  let isMainDeviceBeingUpdated = false;
  for (let workspaceKeyBox of deviceWorkspaceKeyBoxes) {
    if (
      workspaceKeyBox.receiverDeviceSigningPublicKey ===
      user.mainDeviceSigningPublicKey
    ) {
      isMainDeviceBeingUpdated = true;
      break;
    }
  }
  if (!isMainDeviceBeingUpdated) {
    throw new UserInputError(
      "User mainDevice must be included in deviceWorkspaceKeyBoxes"
    );
  }
  const lastGenerationKey = await prisma.workspaceKey.findFirst({
    where: { workspaceId },
    orderBy: { generation: "desc" },
  });
  if (!lastGenerationKey) {
    throw new UserInputError("workspaceKey doesn't exist for workspaceId");
  }
  const newWorkspaceKey = await prisma.workspaceKey.create({
    data: {
      id: generateId(),
      workspaceId,
      generation: lastGenerationKey.generation + 1,
    },
  });
  const workspaceKeyBoxData: WorkspaceKeyBox[] = [];
  deviceWorkspaceKeyBoxes.forEach((keyBoxData) => {
    workspaceKeyBoxData.push({
      id: generateId(),
      workspaceKeyId: newWorkspaceKey.id,
      creatorDeviceSigningPublicKey: creatorDevice.signingPublicKey,
      deviceSigningPublicKey: keyBoxData.receiverDeviceSigningPublicKey,
      ciphertext: keyBoxData.ciphertext,
      nonce: keyBoxData.nonce,
    });
  });
  await prisma.workspaceKeyBox.createMany({ data: workspaceKeyBoxData });
  const createdWorkspaceKeyBoxes = await prisma.workspaceKeyBox.findMany({
    where: { workspaceKeyId: newWorkspaceKey.id },
  });
  const returnedWorskpaceKey: WorkspaceKey = newWorkspaceKey;
  returnedWorskpaceKey.workspaceKeyBoxes = createdWorkspaceKeyBoxes;
  return returnedWorskpaceKey;
};
