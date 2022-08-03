import { useHasEditorSidebar } from "@serenity-tools/editor/hooks/useHasEditorSidebar";
import { tw, Avatar, AvatarGroup, Button, Icon } from "@serenity-tools/ui";
import { HStack } from "native-base";
import { Modal } from "@serenity-tools/ui";
import React, { useState } from "react";
import { PageShareModalContent } from "../pageShareModalContent/PageShareModalContent";

export function PageHeaderRight() {
  const hasEditorSidebar = useHasEditorSidebar();
  const [isActiveShareModal, setIsActiveShareModal] = useState(false);

  return (
    <>
      <HStack
        style={tw`h-full ${
          hasEditorSidebar ? "w-sidebar border-l bg-gray-100" : "w-32"
        } px-3 border-b border-gray-200`}
        justifyContent="space-between"
        alignItems="center"
      >
        <AvatarGroup max={hasEditorSidebar ? 3 : 2} _avatar={{ size: "sm" }}>
          <Avatar bg="green.400">BE</Avatar>
          <Avatar bg="yellow.400">AN</Avatar>
          <Avatar bg="orange.400">NG</Avatar>
          <Avatar bg="yellow.300">NG</Avatar>
          <Avatar bg="green.300">NG</Avatar>
        </AvatarGroup>
        {hasEditorSidebar ? (
          <Button
            size="small"
            onPress={() => {
              setIsActiveShareModal(true);
            }}
          >
            Share
          </Button>
        ) : (
          <Icon name="more-2-line" />
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
