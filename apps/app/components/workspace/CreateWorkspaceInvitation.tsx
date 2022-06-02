import React, { useEffect, useState, useRef } from "react";
import {
  Button,
  LabeledInput,
  Text,
  View,
  ViewProps,
} from "@serenity-tools/ui";
import {
  useWorkspaceInvitationsQuery,
  useCreateWorkspaceInvitationMutation,
  useDeleteWorkspaceInvitationsMutation,
} from "../../generated/graphql";
import Clipboard from "@react-native-clipboard/clipboard";
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
  onWorkspaceInvitationCreated: ({
    workspaceInvitation: WorkspaceInvitation,
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
  const [workspaceInvitations, _setWorkspaceInvitations] = useState<
    WorkspaceInvitation[]
  >([]);
  const [workspaceInvitationsLookup, setWorkspaceInvitationsLookup] = useState(
    {}
  );
  const [selectedWorkspaceInvitationId, setSelectedWorkspaceInvitationId] =
    useState<string | null>(null);
  const [isLoadingWorkspaceInvitations, setIsLoadingWorkspaceInvitations] =
    useState<boolean>(false);
  const [hasGraphqlError, setHasGraphqlError] = useState<boolean>(false);
  const [graphqlError, setGraphqlError] = useState<string>("");
  const [isClipboardNoticeActive, setIsClipboardNoticeActive] =
    useState<boolean>(false);
  const CLIPBOARD_NOTICE_TIMEOUT_SECONDS = 2;

  const setWorkspaceInvitations = (workspaceInvitations: any[]) => {
    // create a lookup table with the string id pointing to the row number
    const lookup = {};
    workspaceInvitations.forEach(
      (workspaceInvitation: WorkspaceInvitation, row: number) => {
        lookup[workspaceInvitation.id] = row;
      }
    );
    setWorkspaceInvitationsLookup(lookup);
    _setWorkspaceInvitations(workspaceInvitations);
  };

  const getWorkspaceInvitationText = () => {
    if (!selectedWorkspaceInvitationId) {
      return;
    }
    return `You are invited to a Serenity Workspace. To join, go to https://serenity.com/invitations/${selectedWorkspaceInvitationId}`;
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

  return (
    <View>
      <Button onPress={createWorkspaceInvitation}>Create Invitation</Button>
      {selectedWorkspaceInvitationId !== null && (
        <>
          <LabeledInput
            label="Invitation text"
            value={getWorkspaceInvitationText()}
          />
          {isClipboardNoticeActive ? (
            <Button disabled>Copied</Button>
          ) : (
            <Button onPress={copyInvitationText}>Copy</Button>
          )}
        </>
      )}
      {workspaceInvitationsResult.fetching ? (
        <Button disabled>Loading...</Button>
      ) : (
        <WorkspaceInvitationList
          workspaceInvitations={
            workspaceInvitationsResult.data?.workspaceInvitations?.nodes || []
          }
          onDeletePress={deleteWorkspaceInvitation}
          onSelect={(id: string) => {
            setSelectedWorkspaceInvitationId(id);
          }}
        />
      )}
    </View>
  );
}
