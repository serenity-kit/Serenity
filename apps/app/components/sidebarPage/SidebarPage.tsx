import React, { useEffect, useRef, useState } from "react";
import { Icon, Link, tw, View, InlineInput } from "@serenity-tools/ui";
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
  const [isEditing, setIsEditing] = useState(false);
  const [, updateDocumentNameMutation] = useUpdateDocumentNameMutation();

  const updateDocumentName = async (name) => {
    const updateDocumentNameResult = await updateDocumentNameMutation({
      input: {
        id: props.documentId,
        name,
      },
    });
    if (
      updateDocumentNameResult.data &&
      updateDocumentNameResult.data.updateDocumentName
    ) {
      // TODO show notification
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
          <InlineInput
            onCancel={() => {
              setIsEditing(false);
            }}
            onSubmit={updateDocumentName}
            value={props.documentName}
          />
        ) : (
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
            // TODO adjust the max-width depending on depth
            style={tw`ml-1.5 max-w-32`}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {props.documentName}
          </Link>
        )}
        <SidebarPageMenu
          documentId={props.documentId}
          refetchDocuments={props.onRefetchDocumentsPress}
          onUpdateNamePress={() => {
            setIsEditing(true);
          }}
        />
      </HStack>
    </View>
  );
}
