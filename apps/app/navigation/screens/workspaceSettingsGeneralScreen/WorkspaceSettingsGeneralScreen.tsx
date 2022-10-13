import {
  Button,
  CenterContent,
  Description,
  Heading,
  InfoMessage,
  Input,
  Modal,
  ModalButtonFooter,
  ModalHeader,
  SettingsContentWrapper,
  Spinner,
  Text,
  View,
} from "@serenity-tools/ui";
import { useMachine } from "@xstate/react";
import { useEffect, useState } from "react";
import { StyleSheet } from "react-native";
import { useWorkspaceId } from "../../../context/WorkspaceIdContext";
import {
  MeResult,
  useDeleteWorkspacesMutation,
  useUpdateWorkspaceNameMutation,
  Workspace,
  WorkspaceMember,
} from "../../../generated/graphql";
import { useWorkspaceContext } from "../../../hooks/useWorkspaceContext";
import { workspaceSettingsLoadWorkspaceMachine } from "../../../machines/workspaceSettingsLoadWorkspaceMachine";
import { WorkspaceDrawerScreenProps } from "../../../types/navigation";
import {
  removeLastUsedDocumentId,
  removeLastUsedWorkspaceId,
} from "../../../utils/lastUsedWorkspaceAndDocumentStore/lastUsedWorkspaceAndDocumentStore";

export default function WorkspaceSettingsGeneralScreen(
  props: WorkspaceDrawerScreenProps<"Settings"> & { children?: React.ReactNode }
) {
  const workspaceId = useWorkspaceId();
  const { activeDevice } = useWorkspaceContext();
  const [state] = useMachine(workspaceSettingsLoadWorkspaceMachine, {
    context: {
      workspaceId: workspaceId,
      navigation: props.navigation,
      activeDevice,
    },
  });
  const [, deleteWorkspacesMutation] = useDeleteWorkspacesMutation();
  const [, updateWorkspaceNameMutation] = useUpdateWorkspaceNameMutation();
  const [workspaceName, setWorkspaceName] = useState<string>("");
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [members, setMembers] = useState<WorkspaceMember[]>([]);
  const [memberLookup, setMemberLookup] = useState<{
    [username: string]: number;
  }>({});
  const [isLoadingWorkspaceData, setIsLoadingWorkspaceData] =
    useState<boolean>(false);
  const [hasGraphqlError, setHasGraphqlError] = useState<boolean>(false);
  const [graphqlError, setGraphqlError] = useState<string>("");
  const [showDeleteWorkspaceModal, setShowDeleteWorkspaceModal] =
    useState<boolean>(false);
  const [deletingWorkspaceName, setDeletingWorkspaceName] =
    useState<string>("");

  useEffect(() => {
    if (
      state.value === "loadWorkspaceSuccess" &&
      state.context.workspaceQueryResult?.data?.workspace
    ) {
      updateWorkspaceData(
        state.context.meWithWorkspaceLoadingInfoQueryResult?.data?.me,
        // @ts-expect-error need to fix the generation
        state.context.workspaceQueryResult?.data?.workspace
      );
    }
  }, [state]);

  const updateWorkspaceData = async (
    me: MeResult | null | undefined,
    workspace: Workspace
  ) => {
    setIsLoadingWorkspaceData(true);
    const workspaceName = workspace.name || "";
    setWorkspaceName(workspaceName);
    const members: WorkspaceMember[] = workspace.members || [];
    setMembers(members);
    const memberLookup = {} as { [username: string]: number };
    members.forEach((member: WorkspaceMember, row: number) => {
      memberLookup[member.userId] = row;
      if (member.userId === me?.id) {
        setIsAdmin(member.isAdmin);
      }
    });
    setMemberLookup(memberLookup);
    setIsLoadingWorkspaceData(false);
  };

  const deleteWorkspace = async () => {
    if (deletingWorkspaceName !== workspaceName) {
      // display an error
      return;
    }
    setIsLoadingWorkspaceData(true);
    setHasGraphqlError(false);
    const deleteWorkspaceResult = await deleteWorkspacesMutation({
      input: {
        ids: [workspaceId],
      },
    });
    if (deleteWorkspaceResult.data?.deleteWorkspaces?.status) {
      removeLastUsedDocumentId(workspaceId);
      removeLastUsedWorkspaceId();
      props.navigation.navigate("Root");
    } else if (deleteWorkspaceResult?.error) {
      setHasGraphqlError(true);
      setGraphqlError(deleteWorkspaceResult?.error.message);
    }
    setIsLoadingWorkspaceData(false);
    setShowDeleteWorkspaceModal(false);
  };

  const updateWorkspaceName = async () => {
    setIsLoadingWorkspaceData(true);
    const updateWorkspaceResult = await updateWorkspaceNameMutation({
      input: {
        id: workspaceId,
        name: workspaceName,
      },
    });
    if (updateWorkspaceResult.data?.updateWorkspaceName?.workspace) {
      updateWorkspaceData(
        state.context.meWithWorkspaceLoadingInfoQueryResult?.data?.me,
        updateWorkspaceResult.data?.updateWorkspaceName?.workspace
      );
    }
    setIsLoadingWorkspaceData(false);
  };

  return (
    <>
      {hasGraphqlError && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorText}>{graphqlError}</Text>
        </View>
      )}
      <SettingsContentWrapper title="General">
        {state.value !== "loadWorkspaceSuccess" ? (
          <CenterContent>
            {state.value === "loadWorkspaceFailed" ? (
              <InfoMessage variant="error">
                Failed to load workspace. Please try again or contact support.
              </InfoMessage>
            ) : (
              <Spinner fadeIn />
            )}
          </CenterContent>
        ) : (
          <>
            <Heading lvl={3} padded>
              Manage workspace
            </Heading>
            <Description variant="form">
              Here you can rename or delete your workspace.
            </Description>
            <Input
              placeholder="New name"
              value={workspaceName}
              onChangeText={setWorkspaceName}
              editable={isAdmin && !isLoadingWorkspaceData}
              label={"Workspace name"}
            />
            {isAdmin && (
              <Button
                onPress={updateWorkspaceName}
                disabled={isLoadingWorkspaceData}
              >
                Update
              </Button>
            )}
            {isAdmin && (
              <Button onPress={() => setShowDeleteWorkspaceModal(true)}>
                Delete workspace
              </Button>
            )}
            {isAdmin && (
              <Modal
                isVisible={showDeleteWorkspaceModal}
                onBackdropPress={() => setShowDeleteWorkspaceModal(false)}
              >
                <ModalHeader>Delete workspace?</ModalHeader>
                <Text>Type the name of this workspace: {workspaceName}</Text>
                <Input
                  label={"Workspace name"}
                  onChangeText={setDeletingWorkspaceName}
                />
                <ModalButtonFooter
                  confirm={
                    <Button
                      disabled={deletingWorkspaceName !== workspaceName}
                      onPress={() => {
                        deleteWorkspace();
                      }}
                    >
                      Delete
                    </Button>
                  }
                />
              </Modal>
            )}
          </>
        )}
      </SettingsContentWrapper>
    </>
  );
}

const styles = StyleSheet.create({
  formError: {
    color: "red",
  },
  errorBanner: {
    backgroundColor: "red",
  },
  errorText: {
    color: "white",
  },
});
