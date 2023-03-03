import {
  Button,
  Description,
  Heading,
  Select,
  SelectItem,
  TextArea,
  tw,
  View,
} from "@serenity-tools/ui";
import canonicalize from "canonicalize";
import * as Clipboard from "expo-clipboard";
import { useState } from "react";
import { Platform, StyleSheet } from "react-native";
import sodium from "react-native-libsodium";
import {
  Role,
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
  role: Role;
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
      _setSharingRole(Role.Commenter);
    }
  };

  const getRoleAsString = (role: Role): string | undefined => {
    if (role === Role.Admin) {
      return "admin";
    } else if (role === Role.Editor) {
      return "editor";
    } else if (role === Role.Viewer) {
      return "viewer";
    } else if (role === Role.Commenter) {
      return "commenter";
    } else {
      console.error(`Unknown role: ${role}`);
      return undefined;
    }
  };

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
    console.log("createWorkspaceInvitationPreflight()");
    const mainDevice = getMainDevice();
    if (!mainDevice) {
      setIsPasswordModalVisible(true);
      return;
    }
    createWorkspaceInvitation(sharingRole);
  };

  const createWorkspaceInvitation = async (sharingRole: Role) => {
    console.log("createWorkspaceInvitation()");
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
      role: getRoleAsString(sharingRole),
      expiresAt: expiresAt.toISOString(),
    });
    const invitationDataSignature = sodium.crypto_sign_detached(
      invitationData!,
      invitationSigningKeys.privateKey
    );
    console.log("invitationDataSignature", invitationDataSignature);
    const createWorkspaceInvitationResult =
      await createWorkspaceInvitationMutation({
        input: {
          workspaceId,
          invitationId,
          invitationSigningPublicKey: sodium.to_base64(
            invitationSigningKeys.publicKey
          ),
          expiresAt,
          role: sharingRole,
          invitationDataSignature: sodium.to_base64(invitationDataSignature),
        },
      });
    console.log(
      "createWorkspaceInvitationResult",
      createWorkspaceInvitationResult
    );
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
      <TextArea
        testID="workspaceInvitationInstructionsText"
        selectable={selectedWorkspaceInvitationId !== null}
        onCopyPress={copyInvitationText}
        isClipboardNoticeActive={isClipboardNoticeActive}
      >
        {selectedWorkspaceInvitationId !== null
          ? getWorkspaceInvitationText()
          : 'The invitation text and link will be generated here\nClick on "Create invitation" to generate a new invitation'}
      </TextArea>
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
          <SelectItem label="Commenter" value="admin" />
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
          createWorkspaceInvitation(sharingRole);
        }}
        onCancel={() => {
          setIsPasswordModalVisible(false);
        }}
      />
    </>
  );
}
