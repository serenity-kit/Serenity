import * as workspaceChain from "@serenity-kit/workspace-chain";
import {
  Button,
  Description,
  Heading,
  Select,
  SelectItem,
  SharetextBox,
  tw,
  View,
} from "@serenity-tools/ui";
import * as Clipboard from "expo-clipboard";
import { useState } from "react";
import { StyleSheet } from "react-native";
import sodium from "react-native-libsodium";
import { useWorkspace } from "../../context/WorkspaceContext";
import {
  Role,
  runCreateWorkspaceInvitationMutation,
  useDeleteWorkspaceInvitationsMutation,
} from "../../generated/graphql";
import { getMainDevice } from "../../utils/device/mainDeviceMemoryStore";
import { getEnvironmentUrls } from "../../utils/getEnvironmentUrls/getEnvironmentUrls";
import { VerifyPasswordModal } from "../verifyPasswordModal/VerifyPasswordModal";
import { WorkspaceInvitationList } from "./WorkspaceInvitationList";

type Props = {};

export function CreateWorkspaceInvitation(props: Props) {
  // TODO: propagate graphql error

  const {
    workspaceId,
    workspaceChainData,
    fetchAndApplyNewWorkspaceChainEntries,
  } = useWorkspace();
  const [, deleteWorkspaceInvitationsMutation] =
    useDeleteWorkspaceInvitationsMutation();
  const [selectedWorkspaceInvitationId, setSelectedWorkspaceInvitationId] =
    useState<string | null>(null);
  const [
    selectedWorkspaceInvitationSigningKeyPairSeed,
    setSelectedWorkspaceInvitationSigningKeyPairSeed,
  ] = useState<string | null>(null);
  const [isPasswordModalVisible, setIsPasswordModalVisible] = useState(false);
  const [invitationIdToDelete, setInvitationIdToDelete] = useState<
    string | null
  >(null);

  const [
    isPasswordModalVisibleForRemovingAnInvitation,
    setIsPasswordModalVisibleForRemovingAnInvitation,
  ] = useState(false);
  const [isClipboardNoticeActive, setIsClipboardNoticeActive] =
    useState<boolean>(false);
  const [sharingRole, _setSharingRole] = useState<Role>(Role.Viewer);
  const CLIPBOARD_NOTICE_TIMEOUT_SECONDS = 2;

  const setSharingRole = (role: string) => {
    if (role === "admin") {
      _setSharingRole(Role.Admin);
    } else if (role === "editor") {
      _setSharingRole(Role.Editor);
    } else if (role === "viewer") {
      _setSharingRole(Role.Viewer);
    } else if (role === "commenter") {
      _setSharingRole(Role.Commenter);
    } else {
      console.error(`Unknown role: ${role}`);
      _setSharingRole(Role.Viewer);
    }
  };

  const getWorkspaceInvitationText = () => {
    if (!selectedWorkspaceInvitationId) {
      return;
    }
    if (!selectedWorkspaceInvitationSigningKeyPairSeed) {
      return;
    }
    const { frontendOrigin } = getEnvironmentUrls();

    return `You are invited to a Serenity Workspace. To join, use this link to accept the invitation:\n${frontendOrigin}/accept-workspace-invitation/${selectedWorkspaceInvitationId}#key=${selectedWorkspaceInvitationSigningKeyPairSeed}`;
  };

  const createWorkspaceInvitationPreflight = async () => {
    const mainDevice = getMainDevice();
    if (!mainDevice) {
      setIsPasswordModalVisible(true);
      return;
    }
    createWorkspaceInvitation(sharingRole);
  };

  const createWorkspaceInvitation = async (sharingRole: Role) => {
    const currentTime = new Date();
    const twoDaysMillis = 2 * 24 * 60 * 60 * 1000;
    const expiresAt = new Date(currentTime.getTime() + twoDaysMillis);
    const mainDevice = getMainDevice();
    if (!mainDevice) {
      throw new Error("No main device");
    }
    if (!workspaceChainData) {
      throw new Error("Missing workspace chain data");
    }
    const invitation = workspaceChain.addInvitation({
      workspaceId,
      authorKeyPair: {
        keyType: "ed25519",
        privateKey: sodium.from_base64(mainDevice.signingPrivateKey),
        publicKey: sodium.from_base64(mainDevice.signingPublicKey),
      },
      expiresAt,
      role: sharingRole,
      prevHash: workspaceChain.hashTransaction(
        workspaceChainData.lastChainEvent.transaction
      ),
    });

    if (invitation.transaction.type !== "add-invitation") {
      throw new Error("Expected invitation transaction");
    }

    const createWorkspaceInvitationResult =
      await runCreateWorkspaceInvitationMutation({
        input: {
          workspaceId,
          serializedWorkspaceChainEvent: JSON.stringify(invitation),
        },
      });
    await fetchAndApplyNewWorkspaceChainEntries();
    if (createWorkspaceInvitationResult.data?.createWorkspaceInvitation) {
      setSelectedWorkspaceInvitationId(invitation.transaction.invitationId);
      setSelectedWorkspaceInvitationSigningKeyPairSeed(
        invitation.invitationSigningKeyPairSeed
      );
    }
  };

  const deleteWorkspaceInvitation = async (invitationId: string) => {
    const mainDevice = getMainDevice();
    if (!mainDevice) {
      throw new Error("No main device");
    }
    if (!workspaceChainData) {
      throw new Error("Missing workspace chain data");
    }
    const removeInvitationEvent = workspaceChain.removeInvitations({
      prevHash: workspaceChain.hashTransaction(
        workspaceChainData.lastChainEvent.transaction
      ),
      authorKeyPair: {
        keyType: "ed25519",
        privateKey: sodium.from_base64(mainDevice.signingPrivateKey),
        publicKey: sodium.from_base64(mainDevice.signingPublicKey),
      },
      invitationIds: [invitationId],
    });

    await deleteWorkspaceInvitationsMutation({
      input: {
        serializedWorkspaceChainEvent: JSON.stringify(removeInvitationEvent),
      },
    });
    setSelectedWorkspaceInvitationId(null);
    await fetchAndApplyNewWorkspaceChainEntries();
  };

  const deleteWorkspaceInvitationPreflight = (invitationId) => {
    const mainDevice = getMainDevice();
    if (!mainDevice) {
      setInvitationIdToDelete(invitationId);
      setIsPasswordModalVisibleForRemovingAnInvitation(true);
      return;
    }
    deleteWorkspaceInvitation(invitationId);
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
      <View style={tw`flex-row justify-between`}>
        <Select
          defaultValue="viewer"
          onValueChange={(value) => {
            setSharingRole(value);
          }}
          testID="invite-members__select-role"
        >
          <SelectItem label="Admin" value="admin" />
          <SelectItem label="Editor" value="editor" />
          <SelectItem label="Commenter" value="commenter" />
          <SelectItem label="Viewer" value="viewer" />
        </Select>
        <Button
          onPress={createWorkspaceInvitationPreflight}
          style={styles.invitationButton}
          testID="invite-members__create-invitation-button"
        >
          Create Invitation
        </Button>
      </View>
      <View style={tw`mb-5`}>
        <Heading lvl={3} padded>
          Invite links
        </Heading>
        <Description variant="form">
          sorted by time until expiration.
        </Description>
      </View>

      <WorkspaceInvitationList
        testID="workspaceInviteeList"
        onDeletePress={(invitationId) => {
          deleteWorkspaceInvitationPreflight(invitationId);
        }}
        onSelect={(id: string) => {
          setSelectedWorkspaceInvitationId(id);
        }}
      />
      <VerifyPasswordModal
        isVisible={isPasswordModalVisible}
        description="Creating a workspace invitation requires access to the main account and therefore verifying your password is required"
        onSuccess={() => {
          setIsPasswordModalVisible(false);
          createWorkspaceInvitation(sharingRole);
        }}
        onCancel={() => {
          setIsPasswordModalVisible(false);
        }}
      />

      <VerifyPasswordModal
        isVisible={isPasswordModalVisibleForRemovingAnInvitation}
        description="Removing a workspace invitation requires access to the main account and therefore verifying your password is required"
        onSuccess={() => {
          setIsPasswordModalVisibleForRemovingAnInvitation(false);
          deleteWorkspaceInvitation(invitationIdToDelete!);
        }}
        onCancel={() => {
          setIsPasswordModalVisibleForRemovingAnInvitation(false);
        }}
      />
    </>
  );
}
