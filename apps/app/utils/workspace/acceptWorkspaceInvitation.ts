import * as workspaceChain from "@serenity-kit/workspace-chain";
import { LocalDevice } from "@serenity-tools/common";
import sodium from "react-native-libsodium";
import {
  Role as RoleEnum,
  runAcceptWorkspaceInvitationMutation,
  runWorkspaceChainByInvitationIdQuery,
} from "../../generated/graphql";
import { notNull } from "../notNull/notNull";

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

  const result = await runAcceptWorkspaceInvitationMutation(
    {
      input: {
        serializedWorkspaceChainEvent: JSON.stringify(acceptInvitationEvent),
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
