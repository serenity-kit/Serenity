import {
  Button,
  Description,
  Heading,
  TextArea,
  tw,
  View,
} from "@serenity-tools/ui";
import * as Clipboard from "expo-clipboard";
import { useState } from "react";
import { Platform, StyleSheet } from "react-native";
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
  const [isPasswordModalVisible, setIsPasswordModalVisible] = useState(false);
  const [isClipboardNoticeActive, setIsClipboardNoticeActive] =
    useState<boolean>(false);
  const CLIPBOARD_NOTICE_TIMEOUT_SECONDS = 2;

  const getWorkspaceInvitationText = () => {
    if (!selectedWorkspaceInvitationId) {
      return;
    }
    const rootUrl =
      process.env.NODE_ENV === "development" ||
      process.env.IS_E2E_TEST === "true"
        ? Platform.OS === "web"
          ? `http://${window.location.host}`
          : // on iOS window.location.host is not available
            `http://localhost:19006/`
        : "https://www.serenity.li";

    return `You are invited to a Serenity Workspace. To join, use this link to accept the invitation:\n${rootUrl}/accept-workspace-invitation/${selectedWorkspaceInvitationId}`;
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
    const createWorkspaceInvitationResult =
      await createWorkspaceInvitationMutation({
        input: {
          workspaceId,
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
