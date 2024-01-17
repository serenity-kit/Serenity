import * as userChain from "@serenity-kit/user-chain";
import * as workspaceMemberDevicesProofUtil from "@serenity-kit/workspace-member-devices-proof";
import {
  Device,
  deriveSessionAuthorization,
  equalUnorderedStringArrays,
  generateId,
} from "@serenity-tools/common";
import { z } from "zod";
import { Prisma } from "../../../prisma/generated/output";
import { addDays } from "../../utils/addDays/addDays";
import { addHours } from "../../utils/addHours/addHours";
import { addYears } from "../../utils/addYears/addYears";
import { prisma } from "../prisma";
import { getLastUserChainEventWithState } from "../userChain/getLastUserChainEventWithState";
import { updateWorkspaceMemberDevicesProof } from "../workspace/updateWorkspaceMemberDevicesProof";

export const DeviceType = z.union([
  z.literal("temporary-web"),
  z.literal("web"),
  z.literal("mobile"),
  z.literal("desktop"),
]);

export type DeviceType = z.infer<typeof DeviceType>;

export type DeviceWithInfo = Device & {
  info: string;
};

type Params = {
  sessionKey: string;
  username: string;
  device: DeviceWithInfo;
  addDeviceEvent: userChain.AddDeviceEvent;
  deviceType: string;
  webDeviceCiphertext?: string;
  webDeviceNonce?: string;
  workspaceMemberDevicesProofEntries: {
    workspaceId: string;
    workspaceMemberDevicesProof: workspaceMemberDevicesProofUtil.WorkspaceMemberDevicesProof;
  }[];
};

export async function createSessionAndDevice({
  sessionKey,
  username,
  device,
  addDeviceEvent,
  deviceType: rawDeviceType,
  webDeviceCiphertext,
  webDeviceNonce,
  workspaceMemberDevicesProofEntries,
}: Params) {
  if (addDeviceEvent.transaction.signingPublicKey !== device.signingPublicKey) {
    throw new Error(
      "addDeviceEvent.transaction.signingPublicKey does not match device.signingPublicKey"
    );
  }
  const deviceType = DeviceType.parse(rawDeviceType);

  let sessionExpiresAt: Date;
  if (deviceType === "temporary-web" || deviceType === "web") {
    if (webDeviceCiphertext === undefined || webDeviceNonce === undefined) {
      throw new Error(
        "Invalid web device since no encrypted version was provided"
      );
    }
    if (addDeviceEvent.transaction.expiresAt === undefined) {
      throw new Error("Invalid device expiration");
    }
    sessionExpiresAt = new Date(addDeviceEvent.transaction.expiresAt);
    if (
      deviceType === "temporary-web" &&
      addHours(new Date(), 25) < sessionExpiresAt
    ) {
      throw new Error("Invalid temporary web device expiration");
    }
    if (deviceType === "web" && addDays(new Date(), 31) < sessionExpiresAt) {
      throw new Error("Invalid web device expiration");
    }
  } else {
    if (addDeviceEvent.transaction.expiresAt !== undefined) {
      throw new Error("Invalid mobile device expiration");
    }
    sessionExpiresAt = addYears(new Date(), 1000);
  }

  return await prisma.$transaction(
    async (prisma) => {
      const user = await prisma.user.findUniqueOrThrow({
        where: { username },
      });
      const userId = user.id;

      const { lastUserChainEvent, userChainState } =
        await getLastUserChainEventWithState({ prisma, userId });

      const newUserChainState = userChain.applyEvent({
        state: userChainState,
        event: addDeviceEvent,
        knownVersion: userChain.version,
      });

      await prisma.userChainEvent.create({
        data: {
          content: addDeviceEvent,
          state: newUserChainState,
          userId,
          position: lastUserChainEvent.position + 1,
        },
      });

      const userWorkspacesIncludingUnauthorized =
        await prisma.usersToWorkspaces.findMany({
          where: { userId },
          select: { workspaceId: true },
        });

      const workspaceIds = userWorkspacesIncludingUnauthorized.map(
        (entry) => entry.workspaceId
      );

      if (
        !equalUnorderedStringArrays(
          workspaceMemberDevicesProofEntries.map((entry) => entry.workspaceId),
          workspaceIds
        )
      ) {
        throw new Error(
          "Invalid workspaceMemberDevicesProofEntries on create session and device"
        );
      }

      for (const entry of workspaceMemberDevicesProofEntries) {
        await updateWorkspaceMemberDevicesProof({
          authorPublicKey: userChainState.mainDeviceSigningPublicKey,
          userId,
          prisma,
          workspaceId: entry.workspaceId,
          userChainEventHash: newUserChainState.eventHash,
          workspaceMemberDevicesProof: entry.workspaceMemberDevicesProof,
        });
      }

      const webDeviceAccessToken = generateId();
      const { sessionToken } = deriveSessionAuthorization({ sessionKey });

      return await prisma.session.create({
        data: {
          sessionToken,
          sessionKey,
          expiresAt: sessionExpiresAt,
          user: { connect: { username } },
          device: {
            create: {
              signingPublicKey: device.signingPublicKey,
              encryptionPublicKey: device.encryptionPublicKey,
              encryptionPublicKeySignature: device.encryptionPublicKeySignature,
              info: device.info,
              user: { connect: { username } },
              expiresAt: addDeviceEvent.transaction.expiresAt,
              webDeviceCiphertext,
              webDeviceNonce,
              webDeviceAccessToken,
            },
          },
        },
        include: {
          device: true,
        },
      });
    },
    {
      isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
    }
  );
}
