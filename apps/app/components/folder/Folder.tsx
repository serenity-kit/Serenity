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
import { useEffect, useState } from "react";
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
import DocumentMenu from "../documentMenu/DocumentMenu";
import DocumentInFolder from "../document/DocumentInFolder";

type Props = {
  workspaceId: string;
  folderId: string;
  folderName: string;
};

export default function Folder(props: Props) {
  const route = useRoute<RootStackScreenProps<"Workspace">["route"]>();
  const navigation = useNavigation();
  const [isOpen, setIsOpen] = useState(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [isSyncingData, setIsSyncingData] = useState<boolean>(false);
  const [folderName, setFolderName] = useState<string>("");
  const [newFolderName, setNewFolderName] = useState<string>("");
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
      console.log("created a folder");
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
  };

  const cancelEditFolderName = () => {
    setIsEditing(false);
    setNewFolderName(folderName);
  };

  const updateFolderName = async () => {
    console.log("UPDATING FOLDER NAME");
    setIsSyncingData(true);
    const updateFolderNameResult = await updateFolderNameMutation({
      input: {
        id: props.folderId,
        name: newFolderName,
      },
    });
    console.log("UPDATED FOLDER NAME");
    console.log({ updateFolderNameResult });
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
    setIsSyncingData(false);
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
          {isEditing ? (
            <Input onChangeText={setNewFolderName} value={newFolderName} />
          ) : (
            <Text>{folderName}</Text>
          )}
          {isEditing ? (
            <>
              <Pressable onPress={updateFolderName}>
                <Icon name="question-mark" />
                <Text>Commit</Text>
              </Pressable>
              <Pressable onPress={cancelEditFolderName}>
                <Icon name="question-mark" />
                <Text>Cancel</Text>
              </Pressable>
            </>
          ) : (
            <>
              <Pressable onPress={createFolder}>
                <Icon name="folder-line" />
              </Pressable>
              <Pressable onPress={createDocument}>
                <Icon name="file-transfer-line" />
              </Pressable>
              <Pressable onPress={editFolderName}>
                <Icon name="question-mark" />
                <Text>Edit</Text>
              </Pressable>
            </>
          )}
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
                    <Folder
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
                  <DocumentInFolder
                    key={document.id}
                    documentId={document.id}
                    documentName={document.name}
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
