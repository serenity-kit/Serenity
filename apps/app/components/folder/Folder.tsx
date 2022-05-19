import { useNavigation, useRoute } from "@react-navigation/native";
import { Icon, Link, Pressable, Text, tw, View } from "@serenity-tools/ui";
import { HStack } from "native-base";
import { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import {
  useCreateDocumentMutation,
  useCreateFolderMutation,
  useDocumentsQuery,
  useFoldersQuery,
} from "../../generated/graphql";
import { RootStackScreenProps } from "../../types";
import DocumentMenu from "../documentMenu/DocumentMenu";

type Props = {
  children: React.ReactNode;
  workspaceId: string;
  folderId: string;
};

export default function Folder(props: Props) {
  const route = useRoute<RootStackScreenProps<"Workspace">["route"]>();
  const navigation = useNavigation();
  const [isOpen, setIsOpen] = useState(false);
  const [, createDocumentMutation] = useCreateDocumentMutation();
  const [, createFolderMutation] = useCreateFolderMutation();
  const [foldersResult] = useFoldersQuery({
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
          <Text>{props.children}</Text>
          <Pressable onPress={createFolder}>
            <Icon name="folder-line" />
          </Pressable>
          <Pressable onPress={createDocument}>
            <Icon name="file-transfer-line" />
          </Pressable>
        </HStack>
      </Pressable>
      {isOpen && (
        <>
          {foldersResult.fetching ? (
            <Text>Loading Folders…</Text>
          ) : foldersResult.data?.folders?.nodes ? (
            foldersResult.data?.folders?.nodes.map((folder) => {
              if (folder === null) {
                return null;
              }
              return (
                <View style={tw`ml-2`} key={folder.id}>
                  <Folder folderId={folder.id} workspaceId={props.workspaceId}>
                    <Text>{folder.name}</Text>
                  </Folder>
                </View>
              );
            })
          ) : null}

          {documentsResult.fetching ? (
            <Text>Loading Documents…</Text>
          ) : documentsResult.data?.documents?.nodes ? (
            documentsResult.data?.documents?.nodes.map((document) => {
              if (document === null) {
                return null;
              }
              return (
                <View style={tw`ml-4`} key={document.id}>
                  <HStack>
                    <Link
                      to={{
                        screen: "Workspace",
                        params: {
                          workspaceId: props.workspaceId,
                          screen: "Page",
                          params: {
                            pageId: document.id,
                          },
                        },
                      }}
                    >
                      {document?.name}
                    </Link>
                    <DocumentMenu
                      documentId={document.id}
                      refetchDocuments={refetchDocuments}
                    />
                  </HStack>
                </View>
              );
            })
          ) : null}
        </>
      )}
    </>
  );
}
