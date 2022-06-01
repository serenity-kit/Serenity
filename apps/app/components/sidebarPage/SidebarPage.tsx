import React, { useEffect, useRef, useState } from "react";
import { StyleSheet } from "react-native";
import {
  Icon,
  Link,
  tw,
  View,
  ViewProps,
  InlineInput,
} from "@serenity-tools/ui";
import { HStack } from "native-base";
import SidebarPageMenu from "../sidebarPageMenu/SidebarPageMenu";
import { useUpdateDocumentNameMutation } from "../../generated/graphql";

type Props = ViewProps & {
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

  const styles = StyleSheet.create({
    page: tw`my-1.5 mx-2.5 ml-6.5`,
  });

  return (
    <View style={[styles.page, props.style]}>
      <HStack justifyContent="space-between">
        <HStack alignItems="center">
          <Icon name="page" size={20} color={tw.color("gray-600")} />
          {isEditing ? (
            <InlineInput
              onCancel={() => {
                setIsEditing(false);
              }}
              onSubmit={updateDocumentName}
              value={props.documentName}
              // TODO adjust width depending on depth
              style={tw`w-32 ml-1.5`}
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
        </HStack>
        <HStack alignItems="center">
          <SidebarPageMenu
            documentId={props.documentId}
            refetchDocuments={props.onRefetchDocumentsPress}
            onUpdateNamePress={() => {
              setIsEditing(true);
            }}
          />
        </HStack>
      </HStack>
    </View>
  );
}
