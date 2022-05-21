import { useNavigation, useRoute } from "@react-navigation/native";
import {
  Icon,
  Link,
  Pressable,
  Text,
  tw,
  View,
  Input,
} from "@serenity-tools/ui";
import { HStack } from "native-base";
import { useEffect, useRef, useState } from "react";
import { ActivityIndicator } from "react-native";
import { v4 as uuidv4 } from "uuid";
import {
  useCreateDocumentMutation,
  useCreateFolderMutation,
  useDocumentsQuery,
  useFoldersQuery,
  useUpdateFolderNameMutation,
} from "../../generated/graphql";
import { RootStackScreenProps } from "../../types";
import SidebarPage from "../sidebarPage/SidebarPage";
import SidebarFolderMenu from "../sidebarFolderMenu/SidebarFolderMenu";

type Props = {
  workspaceId: string;
  folderId: string;
  folderName: string;
};

export default function SidebarFolder(props: Props) {
  const route = useRoute<RootStackScreenProps<"Workspace">["route"]>();
  const navigation = useNavigation();
  const [isOpen, setIsOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [folderName, setFolderName] = useState("");
  const [newFolderName, setNewFolderName] = useState("");
  const inputRef = useRef(null);
  const [, createDocumentMutation] = useCreateDocumentMutation();
  const [, createFolderMutation] = useCreateFolderMutation();
  const [, updateFolderNameMutation] = useUpdateFolderNameMutation();
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

  useEffect(() => {
    if (props.folderName) {
      setFolderName(props.folderName);
    }
  }, [props.folderName]);

  const createFolder = async () => {
    setIsOpen(true);
    const id = uuidv4();
    const result = await createFolderMutation({
      input: {
        id,
        workspaceId: props.workspaceId,
        parentFolderId: props.folderId,
      },
    });
    if (result.data?.createFolder?.folder?.id) {
      // show notification
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
    setNewFolderName(folderName);
    setIsEditing(true);
    // necessary hack due focus issues probably related to the Menu component
    setTimeout(() => {
      // @ts-expect-error ref not properly typed
      inputRef.current?.focus();
    }, 200);
  };

  const cancelEditFolderName = () => {
    setIsEditing(false);
    setNewFolderName(folderName);
  };

  const updateFolderName = async () => {
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
      const updatedFolderName =
        updateFolderNameResult.data.updateFolderName.folder?.name || "Untitled";
      setFolderName(updatedFolderName);
    } else {
      // TODO: show error: couldn't update folder name
    }
    setIsEditing(false);
  };

  return (
    <>
      <Pressable
        onPress={() => {
          setIsOpen((currentIsOpen) => !currentIsOpen);
        }}
      >
        <HStack>
          {isOpen ? (
            <Icon name="arrow-down-s-fill" />
          ) : (
            <Icon name="arrow-right-s-fill" />
          )}
          <Icon name="folder" />
          <Input
            ref={inputRef}
            autofocus={isEditing}
            // needed instead of a conditional for the ref to work
            style={!isEditing && { display: "none" }}
            onChangeText={setNewFolderName}
            value={newFolderName}
            onBlur={updateFolderName}
            onKeyPress={(evt) => {
              if (evt.nativeEvent.key === "Escape") {
                evt.preventDefault();
                evt.stopPropagation(); // to avoid closing the drawer
                cancelEditFolderName();
              }
            }}
          />
          {!isEditing && <Text>{folderName}</Text>}
          <SidebarFolderMenu
            folderId={props.folderId}
            refetchFolders={refetchFolders}
            onUpdateNamePress={editFolderName}
          />
          <Pressable onPress={createFolder}>
            <Icon name="folder-line" />
          </Pressable>
          <Pressable onPress={createDocument}>
            <Icon name="file-transfer-line" />
          </Pressable>

          {documentsResult.fetching ||
            (foldersResult.fetching && <ActivityIndicator />)}
        </HStack>
      </Pressable>
      {isOpen && (
        <>
          {foldersResult.data?.folders?.nodes
            ? foldersResult.data?.folders?.nodes.map((folder) => {
                if (folder === null) {
                  return null;
                }
                return (
                  <View style={tw`ml-2`} key={folder.id}>
                    <SidebarFolder
                      folderId={folder.id}
                      workspaceId={props.workspaceId}
                      folderName={folder.name}
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
                  <SidebarPage
                    key={document.id}
                    documentId={document.id}
                    documentName={document.name || "Untitled"}
                    workspaceId={props.workspaceId}
                    onRefetchDocumentsPress={refetchDocuments}
                  />
                );
              })
            : null}
        </>
      )}
    </>
  );
}
