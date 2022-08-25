import {
  tw,
  Avatar,
  AvatarGroup,
  Button,
  Icon,
  useHasEditorSidebar,
  IconButton,
  View,
  Text,
} from "@serenity-tools/ui";
import { Keyboard } from "react-native";
import { HStack } from "native-base";
import { Modal } from "@serenity-tools/ui";
import React, { useState } from "react";
import { PageShareModalContent } from "../pageShareModalContent/PageShareModalContent";
import { useEditorStore } from "../../utils/editorStore/editorStore";

export function PageHeaderRight() {
  const hasEditorSidebar = useHasEditorSidebar();
  const [isActiveShareModal, setIsActiveShareModal] = useState(false);
  const isInEditingMode = useEditorStore((state) => state.isInEditingMode);
  const triggerBlur = useEditorStore((state) => state.triggerBlur);

  return (
    <>
      <HStack
        style={tw`h-full ${
          hasEditorSidebar ? "w-sidebar border-l bg-gray-100" : ""
        } px-3 border-b border-gray-200`}
        justifyContent="space-between"
        alignItems="center"
        alignContent={hasEditorSidebar ? "center" : "flex-end"}
      >
        {/* spacer to push the avatar group to the right */}
        <View style={tw`flex-1 flex-grow`} />
        <AvatarGroup max={hasEditorSidebar ? 3 : 2} _avatar={{ size: "sm" }}>
          <Avatar customColor="emerald">BE</Avatar>
          <Avatar customColor="honey">NG</Avatar>
          <Avatar customColor="orange">AB</Avatar>
          <Avatar customColor="rose">SK</Avatar>
          <Avatar customColor="serenity">AD</Avatar>
        </AvatarGroup>
        {hasEditorSidebar ? (
          <Button
            size="sm"
            onPress={() => {
              setIsActiveShareModal(true);
            }}
          >
            Share
          </Button>
        ) : (
          <>
            <IconButton
              name="more-2-line"
              size="lg"
              onPress={() => {
                alert("TODO");
              }}
            />
            {isInEditingMode ? (
              <IconButton
                name="check-line"
                size="lg"
                color="primary-500"
                onPress={() => {
                  triggerBlur();
                }}
              />
            ) : null}
          </>
        )}
      </HStack>
      <Modal
        isVisible={isActiveShareModal}
        onBackdropPress={() => {
          setIsActiveShareModal(false);
        }}
      >
        <PageShareModalContent />
      </Modal>
    </>
  );
}
