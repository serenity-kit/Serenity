import React, { useEffect, useState } from "react";
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
import DocumentMenu from "../documentMenu/DocumentMenu";
import { useUpdateDocumentNameMutation } from "../../generated/graphql";

type Props = {
  documentId: string;
  workspaceId: string;
  documentName: string;
  onRefetchDocumentsPress: () => void;
};

export default function DocumentInFolder(props: Props) {
  const [isSyncingData, setIsSyncingData] = useState<boolean>(false);
  const [newDocumentName, setNewDocumentName] = useState<string>("");
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [documentName, setDocumentName] = useState<string>("");
  const [, updateDocumentNameMutation] = useUpdateDocumentNameMutation();

  useEffect(() => {
    setDocumentName(props.documentName);
  }, [props.documentName]);

  const editDocumentName = () => {
    setNewDocumentName(documentName);
    setIsEditing(true);
  };

  const cancelEditFolderName = () => {
    setIsEditing(false);
    setNewDocumentName(documentName);
  };

  const updateDocumentName = async () => {
    console.log("UPDATING DOCUMENT NAME");
    setIsSyncingData(true);
    const updateDocumentNameResult = await updateDocumentNameMutation({
      input: {
        id: props.documentId,
        name: newDocumentName,
      },
    });
    console.log("UPDATED DOCUMENT NAME");
    console.log({ updateDocumentNameResult });
    if (
      updateDocumentNameResult.data &&
      updateDocumentNameResult.data.updateDocumentName
    ) {
      const updatedDocumentName =
        updateDocumentNameResult.data.updateDocumentName.document?.name ||
        "Untitled";
      setDocumentName(updatedDocumentName);
    } else {
      // TODO: show error: couldn't update folder name
    }
    setIsEditing(false);
    setIsSyncingData(false);
  };

  return (
    <View style={tw`ml-4`}>
      <HStack>
        <Icon name="page" />
        {isEditing ? (
          <>
            <Input onChangeText={setNewDocumentName} value={newDocumentName} />
            <Pressable onPress={updateDocumentName}>
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
            <Link
              to={{
                screen: "Workspace",
                params: {
                  workspaceId: props.workspaceId,
                  screen: "Page",
                  params: {
                    pageId: props.documentId,
                  },
                },
              }}
            >
              {documentName}
            </Link>
            <Pressable onPress={editDocumentName}>
              <Icon name="question-mark" />
              <Text>Edit</Text>
            </Pressable>
          </>
        )}
        <DocumentMenu
          documentId={props.documentId}
          refetchDocuments={props.onRefetchDocumentsPress}
          onUpdateNamePress={editDocumentName}
        />
      </HStack>
    </View>
  );
}
