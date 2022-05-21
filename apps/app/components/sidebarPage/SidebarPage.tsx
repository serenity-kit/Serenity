import React, { useEffect, useRef, useState } from "react";
import { Icon, Link, tw, View, Input } from "@serenity-tools/ui";
import { HStack } from "native-base";
import SidebarPageMenu from "../sidebarPageMenu/SidebarPageMenu";
import { useUpdateDocumentNameMutation } from "../../generated/graphql";

type Props = {
  documentId: string;
  workspaceId: string;
  documentName: string;
  onRefetchDocumentsPress: () => void;
};

export default function SidebarPage(props: Props) {
  const [newDocumentName, setNewDocumentName] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [documentName, setDocumentName] = useState("");
  const [, updateDocumentNameMutation] = useUpdateDocumentNameMutation();
  const inputRef = useRef(null);

  useEffect(() => {
    setDocumentName(props.documentName);
  }, [props.documentName]);

  const editDocumentName = () => {
    setNewDocumentName(documentName);
    setIsEditing(true);
    // necessary hack due focus issues probably related to the Menu component
    setTimeout(() => {
      // @ts-expect-error ref not properly typed
      inputRef.current?.focus();
    }, 200);
  };

  const cancelEditDocumentName = () => {
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
        <Input
          ref={inputRef}
          // needed instead of a conditional for the ref to work
          style={!isEditing && { display: "none" }}
          onChangeText={setNewDocumentName}
          value={newDocumentName}
          onBlur={updateDocumentName}
          onKeyPress={(evt) => {
            if (evt.nativeEvent.key === "Escape") {
              evt.preventDefault();
              evt.stopPropagation(); // to avoid closing the drawer
              cancelEditDocumentName();
            }
          }}
        />
        {!isEditing && (
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
        )}
        <SidebarPageMenu
          documentId={props.documentId}
          refetchDocuments={props.onRefetchDocumentsPress}
          onUpdateNamePress={editDocumentName}
        />
      </HStack>
    </View>
  );
}
