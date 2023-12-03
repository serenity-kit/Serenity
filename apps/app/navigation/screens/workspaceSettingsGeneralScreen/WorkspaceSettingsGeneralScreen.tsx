import { encryptWorkspaceInfo } from "@serenity-tools/common";
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
import { getCurrentUserInfo } from "../../../store/currentUserInfoStore";
import { useCanEditWorkspace } from "../../../store/workspaceChainStore";
import { WorkspaceStackScreenProps } from "../../../types/navigationProps";
import { showToast } from "../../../utils/toast/showToast";

export default function WorkspaceSettingsGeneralScreen(
  props: WorkspaceStackScreenProps<"WorkspaceSettingsGeneral"> & {
    children?: React.ReactNode;
  }
) {
  const { workspaceId } = useWorkspace();
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
    if (state.value === "loadWorkspaceSuccess") {
      setWorkspaceName(state.context.workspaceInfo?.name || "");
    }
  }, [state.context.workspaceInfo?.name, state.value]);

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
    if (!state.context.currentWorkspaceKey) {
      throw new Error("currentWorkspaceKey is missing");
    }

    const encryptedWorkspaceInfo = encryptWorkspaceInfo({
      name: workspaceName,
      key: state.context.currentWorkspaceKey.key,
    });

    const updateWorkspaceResult = await updateWorkspaceNameMutation({
      input: {
        id: workspaceId,
        infoCiphertext: encryptedWorkspaceInfo.ciphertext,
        infoNonce: encryptedWorkspaceInfo.nonce,
        infoWorkspaceKeyId: state.context.currentWorkspaceKey.id,
      },
    });
    if (
      typeof updateWorkspaceResult.data?.updateWorkspaceName?.workspace?.id ===
      "string"
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

  const currentUserInfo = getCurrentUserInfo();
  if (!currentUserInfo) throw new Error("No current user");
  const canEditWorkspace = useCanEditWorkspace({
    workspaceId,
    mainDeviceSigningPublicKey: currentUserInfo.mainDeviceSigningPublicKey,
  });

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
              isDisabled={!(canEditWorkspace && !isLoadingWorkspaceData)}
              label={"Workspace name"}
            />
            {canEditWorkspace && (
              <Button
                onPress={updateWorkspaceName}
                disabled={isLoadingWorkspaceData}
              >
                Update
              </Button>
            )}
            {canEditWorkspace && (
              <Button onPress={() => setShowDeleteWorkspaceModal(true)}>
                Delete workspace
              </Button>
            )}
            {canEditWorkspace && (
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
