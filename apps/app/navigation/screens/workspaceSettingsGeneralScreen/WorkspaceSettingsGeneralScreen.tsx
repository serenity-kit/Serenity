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
import { useWorkspace } from "../../../context/WorkspaceContext";
import {
  useDeleteWorkspacesMutation,
  useUpdateWorkspaceNameMutation,
} from "../../../generated/graphql";
import { useAuthenticatedAppContext } from "../../../hooks/useAuthenticatedAppContext";
import { workspaceSettingsLoadWorkspaceMachine } from "../../../machines/workspaceSettingsLoadWorkspaceMachine";
import { WorkspaceStackScreenProps } from "../../../types/navigationProps";
import {
  removeLastUsedDocumentId,
  removeLastUsedWorkspaceId,
} from "../../../utils/lastUsedWorkspaceAndDocumentStore/lastUsedWorkspaceAndDocumentStore";
import { showToast } from "../../../utils/toast/showToast";

export default function WorkspaceSettingsGeneralScreen(
  props: WorkspaceStackScreenProps<"WorkspaceSettingsGeneral"> & {
    children?: React.ReactNode;
  }
) {
  const { workspaceId, workspaceChainState } = useWorkspace();
  const { activeDevice } = useAuthenticatedAppContext();
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
  const [isLoadingWorkspaceData, setIsLoadingWorkspaceData] =
    useState<boolean>(false);
  const [showDeleteWorkspaceModal, setShowDeleteWorkspaceModal] =
    useState<boolean>(false);
  const [deletingWorkspaceName, setDeletingWorkspaceName] =
    useState<string>("");

  useEffect(() => {
    if (
      state.value === "loadWorkspaceSuccess" &&
      state.context.workspaceQueryResult?.data?.workspace
    ) {
      setWorkspaceName(
        state.context.workspaceQueryResult.data.workspace.name || ""
      );
    }
  }, [state]);

  const deleteWorkspace = async () => {
    if (deletingWorkspaceName !== workspaceName) {
      // display an error
      return;
    }
    setIsLoadingWorkspaceData(true);
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
      showToast(
        "Failed to delete the workspace. Please try again or contact support.",
        "error"
      );
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
    if (
      typeof updateWorkspaceResult.data?.updateWorkspaceName?.workspace
        ?.name === "string"
    ) {
      showToast("Workspace name updated.", "info");
    } else {
      showToast(
        "Failed to update the workspace name. Please try again or contact support.",
        "error"
      );
    }
    setIsLoadingWorkspaceData(false);
  };

  let currentUserIsAdmin = false;
  if (state.value === "loadWorkspaceSuccess" && workspaceChainState) {
    Object.entries(workspaceChainState.members).forEach(
      ([mainDeviceSigningPublicKey, memberInfo]) => {
        if (
          memberInfo.role === "ADMIN" &&
          mainDeviceSigningPublicKey ===
            state.context.meWithWorkspaceLoadingInfoQueryResult?.data?.me
              ?.mainDeviceSigningPublicKey
        ) {
          currentUserIsAdmin = true;
        }
      }
    );
  }

  return (
    <>
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
            <View>
              <Heading lvl={3} padded>
                Manage workspace
              </Heading>
              <Description variant="form">
                Here you can rename or delete your workspace.
              </Description>
            </View>
            <Input
              placeholder="New name"
              value={workspaceName}
              onChangeText={setWorkspaceName}
              editable={currentUserIsAdmin && !isLoadingWorkspaceData}
              label={"Workspace name"}
            />
            {currentUserIsAdmin && (
              <Button
                onPress={updateWorkspaceName}
                disabled={isLoadingWorkspaceData}
              >
                Update
              </Button>
            )}
            {currentUserIsAdmin && (
              <Button onPress={() => setShowDeleteWorkspaceModal(true)}>
                Delete workspace
              </Button>
            )}
            {currentUserIsAdmin && (
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
