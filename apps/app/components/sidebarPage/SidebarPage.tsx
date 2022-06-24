import React, { useEffect, useRef, useState } from "react";
import { StyleSheet, Platform } from "react-native";
import { useFocusRing } from "@react-native-aria/focus";
import { Link as ReactNavigationLink } from "@react-navigation/native";
import {
  Icon,
  tw,
  View,
  Text,
  ViewProps,
  InlineInput,
} from "@serenity-tools/ui";
import { HStack } from "native-base";
import SidebarPageMenu from "../sidebarPageMenu/SidebarPageMenu";
import { useUpdateDocumentNameMutation } from "../../generated/graphql";
import { useDocumentStore } from "../../utils/document/documentStore";

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
  const { isFocusVisible, focusProps: focusRingProps }: any = useFocusRing();
  const document = useDocumentStore((state) => state.document);
  const documentStore = useDocumentStore();

  const [, updateDocumentNameMutation] = useUpdateDocumentNameMutation();
  const { depth = 0 } = props;

  const updateDocumentName = async (name) => {
    const updateDocumentNameResult = await updateDocumentNameMutation({
      input: {
        id: props.documentId,
        name,
      },
    });
    if (updateDocumentNameResult.data?.updateDocumentName?.document) {
      // TODO show notification
      const document =
        updateDocumentNameResult.data.updateDocumentName.document;
      documentStore.update(document);
    } else {
      // TODO: show error: couldn't update folder name
      // refetch to revert back to actual name
    }
    setIsEditing(false);
  };

  const styles = StyleSheet.create({
    page: tw`px-2`,
    hover: tw`bg-gray-200`,
    focusVisible: Platform.OS === "web" ? tw`se-inset-focus-mini` : {},
  });

  const maxWidth = 32 - depth * 2;

  return (
    <View
      style={[
        styles.page,
        props.style,
        isHovered && styles.hover,
        isFocusVisible && styles.focusVisible,
      ]}
      // @ts-expect-error as views usually don't have hover
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
                style={tw`ml-0.5 w-${maxWidth}`}
              />
            </HStack>
          ) : (
            <ReactNavigationLink
              {...focusRingProps} // needed so focus is shown on view-wrapper
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
              style={[
                tw`flex w-full py-1.5`,
                Platform.OS === "web" && { outlineWidth: 0 }, // override default outline
              ]}
            >
              <HStack style={tw`grow-1`}>
                {/* @icon : needs to be here in both versions (isEditing & not)
                            as we want the clickable area as big as possible
                */}
                <Icon name="page" size={20} color={tw.color("gray-600")} />
                {/* TODO check why ellipsis is broken => renders as span .. but why ?? */}
                <Text
                  variant="small"
                  style={[tw`pl-1.5 max-w-${maxWidth}`]}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                  bold={document?.id === props.documentId}
                >
                  {props.documentName}
                </Text>
              </HStack>
            </ReactNavigationLink>
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
