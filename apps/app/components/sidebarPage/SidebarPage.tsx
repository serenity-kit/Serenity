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
    page: tw`px-2`,
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
      <HStack>
        <HStack alignItems="center" style={tw`grow-1`}>
          {isEditing ? (
            <HStack style={tw`py-1.5`}>
              {/* @icon : needs to be here in both versions (isEditing & not) as putting the 
                          InlineInput inside the Link adds weird behaviour we don't want
              */}
              <Icon name="page" size={20} color={tw.color("gray-600")} />
              <InlineInput
                onCancel={() => {
                  setIsEditing(false);
                }}
                onSubmit={updateDocumentName}
                value={props.documentName}
                style={tw`w-${maxWidth} ml-1.5`}
              />
            </HStack>
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
              style={tw`flex w-full py-1.5 no-underline`}
            >
              <HStack style={tw`grow-1`}>
                {/* @icon : needs to be here in both versions (isEditing & not)
                            as we want the clickable area as big as possible
                */}
                <Icon name="page" size={20} color={tw.color("gray-600")} />
                <Text
                  variant="small"
                  style={tw`max-w-${maxWidth} pl-1.5`}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {props.documentName}
                </Text>
              </HStack>
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
