import {
  Button,
  Description,
  Heading,
  SharetextBox,
  tw,
  View,
} from "@serenity-tools/ui";
import canonicalize from "canonicalize";
import * as Clipboard from "expo-clipboard";
import { useState } from "react";
import { Platform, StyleSheet } from "react-native";
import sodium from "react-native-libsodium";
import {
  useCreateWorkspaceInvitationMutation,
  useDeleteWorkspaceInvitationsMutation,
  useWorkspaceInvitationsQuery,
} from "../../generated/graphql";
import { getMainDevice } from "../../utils/device/mainDeviceMemoryStore";
import { VerifyPasswordModal } from "../verifyPasswordModal/VerifyPasswordModal";
import { WorkspaceInvitationList } from "./WorkspaceInvitationList";

type WorkspaceInvitation = {
  id: string;
  workspaceId: string;
  inviterUserId: string;
  inviterUsername: string;
  expiresAt: Date;
};

type Props = {
  workspaceId: string;
  onWorkspaceInvitationCreated: (params: {
    workspaceInvitation: WorkspaceInvitation;
  }) => void;
};

export function CreateWorkspaceInvitation(props: Props) {
  // TODO: propagate graphql error
  const workspaceId = props.workspaceId;
  const [workspaceInvitationsResult, refetchWorkspaceInvitationsResult] =
    useWorkspaceInvitationsQuery({ variables: { workspaceId } });
  const [, createWorkspaceInvitationMutation] =
    useCreateWorkspaceInvitationMutation();
  const [, deleteWorkspaceInvitationsMutation] =
    useDeleteWorkspaceInvitationsMutation();
  const [selectedWorkspaceInvitationId, setSelectedWorkspaceInvitationId] =
    useState<string | null>(null);
  const [
    selectedWorkspaceInvitationSigningPrivateKey,
    setSelectedWorkspaceInvitationSigningPrivateKey,
  ] = useState<string | null>(null);
  const [isPasswordModalVisible, setIsPasswordModalVisible] = useState(false);
  const [isClipboardNoticeActive, setIsClipboardNoticeActive] =
    useState<boolean>(false);
  const CLIPBOARD_NOTICE_TIMEOUT_SECONDS = 2;

  const getWorkspaceInvitationText = () => {
    if (!selectedWorkspaceInvitationId) {
      return;
    }
    if (!selectedWorkspaceInvitationSigningPrivateKey) {
      return;
    }
    const rootUrl =
      process.env.NODE_ENV === "development" ||
      process.env.SERENITY_ENV === "e2e"
        ? Platform.OS === "web"
          ? `http://${window.location.host}`
          : // on iOS window.location.host is not available
            `http://localhost:19006/`
        : "https://www.serenity.li";

    return `You are invited to a Serenity Workspace. To join, use this link to accept the invitation:\n${rootUrl}/accept-workspace-invitation/${selectedWorkspaceInvitationId}#key=${selectedWorkspaceInvitationSigningPrivateKey}`;
  };

  const createWorkspaceInvitationPreflight = async () => {
    const mainDevice = getMainDevice();
    if (!mainDevice) {
      setIsPasswordModalVisible(true);
      return;
    }
    createWorkspaceInvitation();
  };

  const createWorkspaceInvitation = async () => {
    const invitationSigningKeys = sodium.crypto_sign_keypair();
    const invitationIdLengthBytes = 24;
    const invitationId = sodium.to_base64(
      sodium.randombytes_buf(invitationIdLengthBytes)
    );
    const currentTime = new Date();
    const twoDaysMillis = 2 * 24 * 60 * 60 * 1000;
    const expiresAt = new Date(currentTime.getTime() + twoDaysMillis);
    const invitationData = canonicalize({
      workspaceId,
      invitationId,
      invitationSigningPublicKey: sodium.to_base64(
        invitationSigningKeys.publicKey
      ),
      expiresAt: expiresAt.toISOString(),
    });
    const invitationDataSignature = sodium.crypto_sign_detached(
      invitationData!,
      invitationSigningKeys.privateKey
    );

    const createWorkspaceInvitationResult =
      await createWorkspaceInvitationMutation({
        input: {
          workspaceId,
          invitationId,
          invitationSigningPublicKey: sodium.to_base64(
            invitationSigningKeys.publicKey
          ),
          expiresAt,
          invitationDataSignature: sodium.to_base64(invitationDataSignature),
        },
      });
    refetchWorkspaceInvitationsResult();
    if (
      createWorkspaceInvitationResult.data?.createWorkspaceInvitation &&
      props.onWorkspaceInvitationCreated
    ) {
      const workspaceInvitation = createWorkspaceInvitationResult.data
        .createWorkspaceInvitation.workspaceInvitation as WorkspaceInvitation;
      props.onWorkspaceInvitationCreated({ workspaceInvitation });
      setSelectedWorkspaceInvitationId(workspaceInvitation.id);
      setSelectedWorkspaceInvitationSigningPrivateKey(
        sodium.to_base64(invitationSigningKeys.privateKey)
      );
    }
  };

  const deleteWorkspaceInvitation = async (id: string) => {
    await deleteWorkspaceInvitationsMutation({
      input: {
        ids: [id],
      },
    });
    setSelectedWorkspaceInvitationId(null);
    refetchWorkspaceInvitationsResult();
  };

  const copyInvitationText = () => {
    const text = getWorkspaceInvitationText();
    if (!text) {
      return;
    }
    Clipboard.setString(text);
    setIsClipboardNoticeActive(true);
    setTimeout(() => {
      setIsClipboardNoticeActive(false);
    }, CLIPBOARD_NOTICE_TIMEOUT_SECONDS * 1000);
  };

  const styles = StyleSheet.create({
    invitationButton: tw`mb-8 self-start`,
  });

  return (
    <>
      <SharetextBox
        testID="workspaceInvitationInstructionsText"
        selectable={selectedWorkspaceInvitationId !== null}
        onCopyPress={copyInvitationText}
        isClipboardNoticeActive={isClipboardNoticeActive}
      >
        {selectedWorkspaceInvitationId !== null
          ? getWorkspaceInvitationText()
          : 'The invitation text and link will be generated here\nClick on "Create invitation" to generate a new invitation'}
      </SharetextBox>
      <Button
        onPress={createWorkspaceInvitationPreflight}
        style={styles.invitationButton}
      >
        Create Invitation
      </Button>
      <View style={tw`mb-5`}>
        <Heading lvl={3} padded>
          Invite links
        </Heading>
        <Description variant="form">
          sorted by time until expiration.
        </Description>
      </View>
      {workspaceInvitationsResult.fetching ? (
        <Button disabled>Loading...</Button>
      ) : (
        <WorkspaceInvitationList
          testID="workspaceInviteeList"
          workspaceInvitations={
            workspaceInvitationsResult.data?.workspaceInvitations?.nodes || []
          }
          onDeletePress={deleteWorkspaceInvitation}
          onSelect={(id: string) => {
            setSelectedWorkspaceInvitationId(id);
          }}
        />
      )}
      <VerifyPasswordModal
        isVisible={isPasswordModalVisible}
        description="Creating a workspace invitation requires access to the main account and therefore verifying your password is required"
        onSuccess={() => {
          setIsPasswordModalVisible(false);
          createWorkspaceInvitation();
        }}
        onCancel={() => {
          setIsPasswordModalVisible(false);
        }}
      />
    </>
  );
}
