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
import SidebarDocumentMenu from "../sidebarDocumentMenu/SidebarDocumentMenu";
import { useUpdateDocumentNameMutation } from "../../generated/graphql";

type Props = {
  documentId: string;
  workspaceId: string;
  documentName: string;
  onRefetchDocumentsPress: () => void;
};

export default function SidebarDocument(props: Props) {
  const [newDocumentName, setNewDocumentName] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [documentName, setDocumentName] = useState("");
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
    const updateDocumentNameResult = await updateDocumentNameMutation({
      input: {
        id: props.documentId,
        name: newDocumentName,
      },
    });
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
      // refetch to revert back to actual name
    }
    setIsEditing(false);
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
          </>
        )}
        <SidebarDocumentMenu
          documentId={props.documentId}
          refetchDocuments={props.onRefetchDocumentsPress}
          onUpdateNamePress={editDocumentName}
        />
      </HStack>
    </View>
  );
}
