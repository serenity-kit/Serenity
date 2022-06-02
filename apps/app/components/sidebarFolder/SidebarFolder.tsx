import { useNavigation, useRoute } from "@react-navigation/native";
import {
  Icon,
  Pressable,
  Text,
  tw,
  View,
  ViewProps,
  InlineInput,
} from "@serenity-tools/ui";
import { HStack } from "native-base";
import { useState } from "react";
import { ActivityIndicator, StyleSheet } from "react-native";
import { v4 as uuidv4 } from "uuid";
import {
  useCreateDocumentMutation,
  useCreateFolderMutation,
  useDocumentsQuery,
  useFoldersQuery,
  useUpdateFolderNameMutation,
  useDeleteFoldersMutation,
} from "../../generated/graphql";
import { RootStackScreenProps } from "../../types";
import SidebarPage from "../sidebarPage/SidebarPage";
import SidebarFolderMenu from "../sidebarFolderMenu/SidebarFolderMenu";

type Props = ViewProps & {
  workspaceId: string;
  folderId: string;
  folderName: string;
  onStructureChange: () => void;
};

export default function SidebarFolder(props: Props) {
  const route = useRoute<RootStackScreenProps<"Workspace">["route"]>();
  const navigation = useNavigation();
  const [isOpen, setIsOpen] = useState(false);
  const [isEditing, setIsEditing] = useState<"none" | "name" | "new">("none");
  const [, createDocumentMutation] = useCreateDocumentMutation();
  const [, createFolderMutation] = useCreateFolderMutation();
  const [, updateFolderNameMutation] = useUpdateFolderNameMutation();
  const [, deleteFoldersMutation] = useDeleteFoldersMutation();
  const [foldersResult, refetchFolders] = useFoldersQuery({
    pause: !isOpen,
    variables: {
      parentFolderId: props.folderId,
      first: 50,
    },
  });
  const [documentsResult, refetchDocuments] = useDocumentsQuery({
    pause: !isOpen,
    variables: {
      parentFolderId: props.folderId,
      first: 50,
    },
  });

  const createFolder = async (name: string | null) => {
    setIsOpen(true);
    const id = uuidv4();
    const result = await createFolderMutation({
      input: {
        id,
        name,
        workspaceId: props.workspaceId,
        parentFolderId: props.folderId,
      },
    });
    if (result.data?.createFolder?.folder?.id) {
      // TODO show notification
      setIsEditing("none");
    } else {
      console.error(result.error);
      alert("Failed to create a folder. Please try again.");
    }
    refetchDocuments();
    refetchFolders();
  };

  const createDocument = async () => {
    setIsOpen(true);
    const id = uuidv4();
    const result = await createDocumentMutation({
      input: {
        id,
        workspaceId: props.workspaceId,
        parentFolderId: props.folderId,
      },
    });
    if (result.data?.createDocument?.id) {
      navigation.navigate("Workspace", {
        workspaceId: route.params.workspaceId,
        screen: "Page",
        params: {
          pageId: result.data?.createDocument?.id,
          isNew: true,
        },
      });
    } else {
      console.error(result.error);
      alert("Failed to create a page. Please try again.");
    }
    refetchDocuments();
    refetchFolders();
  };

  const editFolderName = () => {
    setIsEditing("name");
  };

  const updateFolderName = async (newFolderName: string) => {
    const updateFolderNameResult = await updateFolderNameMutation({
      input: {
        id: props.folderId,
        name: newFolderName,
      },
    });
    if (
      updateFolderNameResult.data &&
      updateFolderNameResult.data.updateFolderName
    ) {
      // TODO show notification
    } else {
      // TODO: show error: couldn't update folder name
    }
    setIsEditing("none");
  };

  const deleteFolder = async (folderId: string) => {
    const deleteFoldersResult = await deleteFoldersMutation({
      input: {
        ids: [folderId],
      },
    });
    if (deleteFoldersResult.data && deleteFoldersResult.data.deleteFolders) {
      props.onStructureChange();
    } else {
      // TODO: show error: couldn't delete folder
    }
  };

  const styles = StyleSheet.create({
    folder: tw``,
  });

  return (
    <View style={[styles.folder, props.style]}>
      <Pressable
        onPress={() => {
          setIsOpen((currentIsOpen) => !currentIsOpen);
        }}
        style={tw`my-1.5 mx-2.5`}
      >
        <HStack justifyContent="space-between">
          <HStack alignItems="center">
            {/* TODO move style property to Icon ? */}
            <div style={tw`ml-0.5 -mr-0.5`}>
              <Icon
                name={isOpen ? "arrow-down-filled" : "arrow-right-filled"}
                color={tw.color("gray-600")}
              />
            </div>
            <Icon name="folder" size={20} />
            {isEditing === "name" ? (
              <InlineInput
                onSubmit={updateFolderName}
                onCancel={() => {
                  setIsEditing("none");
                }}
                value={props.folderName}
                // TODO adjust width depending on depth
                style={tw`w-32 ml-1.5`}
              />
            ) : (
              <Text
                variant="small"
                // TODO adjust the max-width depending on depth
                style={tw`ml-1.5 max-w-32`}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {props.folderName}
              </Text>
            )}
          </HStack>

          <HStack alignItems="center" space="1.5">
            <SidebarFolderMenu
              folderId={props.folderId}
              refetchFolders={refetchFolders}
              onUpdateNamePress={editFolderName}
              onDeletePressed={() => deleteFolder(props.folderId)}
              onCreateFolderPress={() => {
                createFolder(null);
              }}
            />
            <Pressable onPress={createDocument}>
              <Icon name="file-add-line" color={tw.color("gray-600")} />
            </Pressable>
            {documentsResult.fetching ||
              (foldersResult.fetching && <ActivityIndicator />)}
          </HStack>
        </HStack>
      </Pressable>
      {isEditing === "new" && (
        <InlineInput
          value=""
          onSubmit={createFolder}
          onCancel={() => {
            setIsEditing("none");
          }}
          // TODO adjust width depending on depth
          style={tw`w-32 ml-1.5`}
        />
      )}

      {isOpen && (
        <>
          {foldersResult.data?.folders?.nodes
            ? foldersResult.data?.folders?.nodes.map((folder) => {
                if (folder === null) {
                  return null;
                }
                return (
                  <View style={tw`ml-3`} key={folder.id}>
                    <SidebarFolder
                      folderId={folder.id}
                      workspaceId={props.workspaceId}
                      folderName={folder.name}
                      onStructureChange={props.onStructureChange}
                    />
                  </View>
                );
              })
            : null}

          {documentsResult.data?.documents?.nodes
            ? documentsResult.data?.documents?.nodes.map((document) => {
                if (document === null) {
                  return null;
                }
                return (
                  <View style={tw`ml-3`} key={document.id}>
                    <SidebarPage
                      documentId={document.id}
                      documentName={document.name || "Untitled"}
                      workspaceId={props.workspaceId}
                      onRefetchDocumentsPress={refetchDocuments}
                    />
                  </View>
                );
              })
            : null}
        </>
      )}
    </View>
  );
}
