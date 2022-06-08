import React, { useEffect, useRef, useState } from "react";
import { StyleSheet } from "react-native";
import {
  Icon,
  Link,
  tw,
  View,
  Text,
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
  depth?: number;
  onRefetchDocumentsPress: () => void;
};

export default function SidebarPage(props: Props) {
  const [isEditing, setIsEditing] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [, updateDocumentNameMutation] = useUpdateDocumentNameMutation();
  const { depth = 0 } = props;

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
    page: tw`py-1.5 px-2.5`,
    hover: tw`bg-gray-200`,
  });

  const maxWidth = 32 - depth * 2;

  return (
    <View
      style={[styles.page, props.style, isHovered && styles.hover]}
      // @ts-expect-error views usually are not hovered
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
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
              style={tw`w-${maxWidth} ml-1.5`}
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
              style={tw`ml-1.5 max-w-${maxWidth} no-underline`}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              <Text variant="small">{props.documentName}</Text>
            </Link>
          )}
        </HStack>

        {isHovered && (
          <HStack alignItems="center">
            <SidebarPageMenu
              documentId={props.documentId}
              refetchDocuments={props.onRefetchDocumentsPress}
              onUpdateNamePress={() => {
                setIsEditing(true);
              }}
            />
          </HStack>
        )}
      </HStack>
    </View>
  );
}
