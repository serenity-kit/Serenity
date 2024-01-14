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
  WorkspaceAvatar,
  tw,
} from "@serenity-tools/ui";
import { useMachine } from "@xstate/react";
import { SaveFormat, manipulateAsync } from "expo-image-manipulator";
import * as ImagePicker from "expo-image-picker";
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
import { loadRemoteWorkspaceMemberDevicesProofQuery } from "../../../store/workspaceMemberDevicesProofStore";
import { WorkspaceStackScreenProps } from "../../../types/navigationProps";
import { prefixPngImageUri } from "../../../utils/prefixPngImageUri/prefixPngImageUri";
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

  const [imageContent, setImageContent] = useState<string | undefined>(
    undefined
  );

  useEffect(() => {
    if (state.value === "loadWorkspaceSuccess") {
      setWorkspaceName(state.context.workspaceInfo?.name || "");
      setImageContent(state.context.workspaceInfo?.avatar);
    }
  }, [
    state.context.workspaceInfo?.name,
    state.context.workspaceInfo?.avatar,
    state.value,
  ]);

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

  const updateWorkspaceInfo = async (avatarStringAsBase64?: string) => {
    setIsLoadingWorkspaceData(true);
    if (!state.context.currentWorkspaceKey) {
      throw new Error("currentWorkspaceKey is missing");
    }

    const workspaceMemberDevicesProof =
      await loadRemoteWorkspaceMemberDevicesProofQuery({ workspaceId });

    const encryptedWorkspaceInfo = encryptWorkspaceInfo({
      name: workspaceName,
      avatar: avatarStringAsBase64 || imageContent,
      key: state.context.currentWorkspaceKey.key,
      device: activeDevice,
      workspaceId,
      workspaceKeyId: state.context.currentWorkspaceKey.id,
      workspaceMemberDevicesProof: workspaceMemberDevicesProof.proof,
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
      showToast("Workspace information updated.", "info");
    } else {
      showToast(
        "Failed to update the workspace information. Please try again or contact support.",
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

  const updateWorkspaceAvatar = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
      base64: true,
    });
    if (result.canceled || !result.assets || !result.assets[0]) {
      console.error("Failed to select an image");
      return;
    }
    // console.log(result);
    // console.log(result.assets[0].base64!);

    const asset = result.assets[0];
    const { width, height } = asset;
    let originX = 0,
      originY = 0;
    let cropWidth = width,
      cropHeight = height;

    // determine cropping based on aspect ratio
    if (width > height) {
      // image is wider than it is tall, crop horizontally
      originX = (width - height) / 2;
      cropWidth = height; // width of the cropped area is the height of the original image
    } else if (height > width) {
      // image is taller than it is wide, crop vertically
      originY = (height - width) / 2;
      cropHeight = width; // height of the cropped area is the width of the original image
    }

    const manipulationResult = await manipulateAsync(
      asset.uri,
      [
        { crop: { originX, originY, width: cropWidth, height: cropHeight } },
        { resize: { height: 128, width: 128 } },
      ],
      { base64: true, format: SaveFormat.PNG }
    );

    console.log(manipulationResult);
    setImageContent(manipulationResult.base64);
    updateWorkspaceInfo(manipulationResult.base64);
  };

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
            <View style={tw`mb-6`}>
              <Heading lvl={3} padded>
                Manage workspace
              </Heading>
              <Description variant="form">
                Here you can update the workspace avatar, rename or delete your
                workspace.
              </Description>
            </View>

            <View style={tw`mb-6`}>
              <WorkspaceAvatar
                size="md"
                source={
                  imageContent
                    ? { uri: prefixPngImageUri(imageContent) }
                    : undefined
                }
              />
              {canEditWorkspace && (
                <Button
                  style={tw`md:w-60 mt-4`}
                  onPress={updateWorkspaceAvatar}
                  disabled={isLoadingWorkspaceData}
                >
                  Update Workspace Avatar
                </Button>
              )}
            </View>

            <Input
              placeholder="New name"
              value={workspaceName}
              onChangeText={setWorkspaceName}
              isDisabled={!(canEditWorkspace && !isLoadingWorkspaceData)}
              label={"Workspace name"}
              style={tw`md:w-60`}
            />
            {canEditWorkspace && (
              <Button
                onPress={() => updateWorkspaceInfo()}
                disabled={isLoadingWorkspaceData}
                style={tw`md:w-60`}
              >
                Update
              </Button>
            )}
            {canEditWorkspace && (
              <Button
                variant="danger"
                onPress={() => setShowDeleteWorkspaceModal(true)}
                style={tw`mt-6 md:w-60`}
              >
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
                      variant="danger"
                      disabled={deletingWorkspaceName !== workspaceName}
                      onPress={() => {
                        deleteWorkspace();
                      }}
                    >
                      Delete
                    </Button>
                  }
                  cancel={
                    <Button
                      onPress={() => {
                        setShowDeleteWorkspaceModal(false);
                      }}
                      variant="secondary"
                    >
                      Cancel delete
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
