import {
  Avatar,
  AvatarGroup,
  Button,
  IconButton,
  Modal,
  tw,
  useHasEditorSidebar,
} from "@serenity-tools/ui";
import { HStack } from "native-base";
import { useState } from "react";
import { useEditorStore } from "../../utils/editorStore/editorStore";
import { PageShareModalContent } from "../pageShareModalContent/PageShareModalContent";

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
      >
        {isInEditingMode && !hasEditorSidebar ? (
          <IconButton
            name="check-line"
            size="lg"
            color="primary-500"
            onPress={() => {
              triggerBlur();
            }}
            // TODO transparent
          />
        ) : (
          <>
            <AvatarGroup
              max={hasEditorSidebar ? 3 : 2}
              _avatar={{ size: "sm" }}
            >
              <Avatar color="emerald">BE</Avatar>
              <Avatar color="honey">NG</Avatar>
              <Avatar color="orange">AB</Avatar>
              <Avatar color="rose">SK</Avatar>
              <Avatar color="serenity">AD</Avatar>
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
                  name="share-line"
                  size="lg"
                  color="gray-900"
                  onPress={() => {
                    setIsActiveShareModal(true);
                  }}
                />
              </>
            )}
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
