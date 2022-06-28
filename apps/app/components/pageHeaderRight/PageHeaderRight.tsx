import { useHasEditorSidebar } from "@serenity-tools/editor/hooks/useHasEditorSidebar";
import { Text, tw, Avatar, AvatarGroup, Button } from "@serenity-tools/ui";
import { HStack } from "native-base";
import { Modal } from "@serenity-tools/ui";
import React, { useState } from "react";
import { PageShareModalContent } from "../pageShareModalContent/PageShareModalContent";

export function PageHeaderRight() {
  const hasEditorSidebar = useHasEditorSidebar();
  const [isActiveShareModal, setIsActiveShareModal] = useState(false);

  if (!hasEditorSidebar) {
    return <Text>Mobile Header Right</Text>;
  }

  return (
    <>
      <HStack
        style={tw`h-full w-sidebar px-3 border-l border-b border-gray-200 bg-gray-100`}
        justifyContent="space-between"
        alignItems="center"
      >
        <AvatarGroup max={3} _avatar={{ size: "sm" }}>
          <Avatar bg="green.400">BE</Avatar>
          <Avatar bg="yellow.400">AN</Avatar>
          <Avatar bg="orange.400">NG</Avatar>
          <Avatar bg="yellow.300">NG</Avatar>
          <Avatar bg="green.300">NG</Avatar>
        </AvatarGroup>
        <Button
          size="small"
          onPress={() => {
            setIsActiveShareModal(true);
          }}
        >
          Share
        </Button>
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
