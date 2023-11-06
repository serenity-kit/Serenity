import * as workspaceChain from "@serenity-kit/workspace-chain";
import * as workspaceMemberDevicesProofUtil from "@serenity-kit/workspace-member-devices-proof";
import { LocalDevice, notNull } from "@serenity-tools/common";
import sodium from "react-native-libsodium";
import {
  Role as RoleEnum,
  runAcceptWorkspaceInvitationMutation,
  runWorkspaceChainByInvitationIdQuery,
  runWorkspaceMemberDevicesProofQuery,
} from "../../generated/graphql";

type Role = `${RoleEnum}`;

export type Props = {
  mainDevice: LocalDevice;
  signingKeyPairSeed: string;
  expiresAt: string;
  invitationId: string;
  workspaceId: string;
  role: Role;
  invitationDataSignature: string;
  invitationSigningPublicKey: string;
  currentUserId: string;
  currentUserChainHash: string;
};

export const acceptWorkspaceInvitation = async ({
  mainDevice,
  signingKeyPairSeed,
  expiresAt,
  invitationId,
  workspaceId,
  invitationDataSignature,
  invitationSigningPublicKey,
  role,
  currentUserId,
  currentUserChainHash,
}: Props): Promise<string> => {
  const workspaceChainByInvitationIdResult =
    await runWorkspaceChainByInvitationIdQuery({ invitationId });

  let lastChainEvent: workspaceChain.WorkspaceChainEvent | null = null;
  if (
    workspaceChainByInvitationIdResult.data?.workspaceChainByInvitationId?.nodes
  ) {
    workspaceChain.resolveState(
      workspaceChainByInvitationIdResult.data.workspaceChainByInvitationId.nodes
        .filter(notNull)
        .map((event) => {
          const data = workspaceChain.WorkspaceChainEvent.parse(
            JSON.parse(event.serializedContent)
          );
          lastChainEvent = data;
          return data;
        })
    );
  }

  if (lastChainEvent === null) {
    throw new Error("Could not find lastChainEvent");
  }

  // @ts-expect-error not sure why the types don't match up here
  const prevHash = workspaceChain.hashTransaction(lastChainEvent.transaction);

  const acceptInvitationEvent = workspaceChain.acceptInvitation({
    prevHash,
    invitationSigningKeyPairSeed: signingKeyPairSeed,
    expiresAt: new Date(expiresAt),
    invitationId,
    role,
    workspaceId,
    invitationDataSignature,
    invitationSigningPublicKey,
    authorKeyPair: {
      keyType: "ed25519",
      privateKey: sodium.from_base64(mainDevice.signingPrivateKey),
      publicKey: sodium.from_base64(mainDevice.signingPublicKey),
    },
  });

  const workspaceMemberDevicesProofQueryResult =
    await runWorkspaceMemberDevicesProofQuery({
      workspaceId,
      invitationId,
    });

  if (
    !workspaceMemberDevicesProofQueryResult.data?.workspaceMemberDevicesProof
  ) {
    throw new Error("Missing workspaceMemberDevicesProof");
  }

  const tmpResult =
    workspaceMemberDevicesProofQueryResult.data?.workspaceMemberDevicesProof;
  const existingWorkspaceMemberDevicesProofData =
    workspaceMemberDevicesProofUtil.WorkspaceMemberDevicesProofData.parse(
      JSON.parse(tmpResult.serializedData)
    );

  // TODO verify the result using isValidWorkspaceMemberDevicesProof
  // TODO verify the result using workspaceChainHash
  // TODO verify your own user chain entry

  const workspaceMemberDevicesProof =
    workspaceMemberDevicesProofUtil.createWorkspaceMemberDevicesProof({
      authorKeyPair: {
        privateKey: sodium.from_base64(mainDevice.signingPrivateKey),
        publicKey: sodium.from_base64(mainDevice.signingPublicKey),
        keyType: "ed25519",
      },
      workspaceMemberDevicesProofData: {
        ...existingWorkspaceMemberDevicesProofData,
        userChainHashes: {
          ...existingWorkspaceMemberDevicesProofData.userChainHashes,
          [currentUserId]: currentUserChainHash,
        },
        clock: existingWorkspaceMemberDevicesProofData.clock + 1,
        workspaceChainHash: workspaceChain.hashTransaction(
          acceptInvitationEvent.transaction
        ),
      },
    });

  const result = await runAcceptWorkspaceInvitationMutation(
    {
      input: {
        serializedWorkspaceChainEvent: JSON.stringify(acceptInvitationEvent),
        serializedWorkspaceMemberDevicesProof: JSON.stringify(
          workspaceMemberDevicesProof
        ),
      },
    },
    { requestPolicy: "network-only" }
  );
  if (result.error) {
    throw new Error(result.error.message);
  }
  if (result.data?.acceptWorkspaceInvitation?.workspaceId) {
    return result.data.acceptWorkspaceInvitation.workspaceId;
  } else {
    throw new Error("Could not accept workspace invitation");
  }
};
