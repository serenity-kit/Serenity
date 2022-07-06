import React, { useState } from "react";
import { StyleSheet, Platform } from "react-native";
import { useFocusRing } from "@react-native-aria/focus";
import {
  Icon,
  tw,
  View,
  Text,
  ViewProps,
  InlineInput,
  Pressable,
} from "@serenity-tools/ui";
import { HStack } from "native-base";
import SidebarPageMenu from "../sidebarPageMenu/SidebarPageMenu";
import { useUpdateDocumentNameMutation } from "../../generated/graphql";
import { useDocumentStore } from "../../utils/document/documentStore";
import { useLinkProps } from "@react-navigation/native";
import { useIsDesktopDevice } from "@serenity-tools/ui";

type Props = ViewProps & {
  documentId: string;
  workspaceId: string;
  documentName: string;
  depth?: number;
  onRefetchDocumentsPress: () => void;
};

export default function SidebarPage(props: Props) {
  const isDesktopDevice = useIsDesktopDevice();
  const [isEditing, setIsEditing] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const { isFocusVisible, focusProps: focusRingProps }: any = useFocusRing();
  const document = useDocumentStore((state) => state.document);
  const documentStore = useDocumentStore();
  const linkProps = useLinkProps({
    to: {
      screen: "Workspace",
      params: {
        workspaceId: props.workspaceId,
        screen: "Page",
        params: {
          pageId: props.documentId,
        },
      },
    },
  });

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
    page: tw``,
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
        <Pressable
          {...linkProps}
          {...focusRingProps} // needed so focus is shown on view-wrapper
          style={[
            tw`grow-1 pl-${7 + depth * 3}`, // needed so clickable area is as large as possible
          ]}
          // disable default outline styles and add 1 overridden style manually (grow)
          _focusVisible={{
            _web: { style: { outlineWidth: 0, flexGrow: 1 } },
          }}
        >
          <HStack
            alignItems="center"
            style={tw`py-3 md:py-1.5 pl-${5 + depth} md:pl-2.5`}
          >
            <Icon
              name="page"
              size={5}
              mobileSize={8}
              color={tw.color("gray-600")}
            />
            {isEditing ? (
              <InlineInput
                onCancel={() => {
                  setIsEditing(false);
                }}
                onSubmit={updateDocumentName}
                value={props.documentName}
                style={tw`ml-0.5 w-${maxWidth}`}
              />
            ) : (
              <Text
                variant="small"
                style={[tw`pl-1.5 max-w-${maxWidth}`]}
                numberOfLines={1}
                ellipsizeMode="tail"
                bold={document?.id === props.documentId}
              >
                {props.documentName}
              </Text>
            )}
          </HStack>
        </Pressable>

        {(isHovered || !isDesktopDevice) && (
          <HStack alignItems="center" space={1} style={tw`pr-3 md:pr-2`}>
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
