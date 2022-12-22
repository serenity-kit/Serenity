import { hashToCollaboratorColor } from "@serenity-tools/common";
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
import { useWorkspace } from "../../context/WorkspaceContext";
import { useEditorStore } from "../../utils/editorStore/editorStore";
import { PageShareModalContent } from "../pageShareModalContent/PageShareModalContent";

export function PageHeaderRight() {
  const hasEditorSidebar = useHasEditorSidebar();
  const { workspaceQueryResult } = useWorkspace();
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
        space={hasEditorSidebar ? 0 : 4}
      >
        {isInEditingMode && !hasEditorSidebar ? (
          <IconButton
            name="check-line"
            size="xl"
            color="primary-500"
            onPress={() => {
              triggerBlur();
            }}
            transparent
          />
        ) : (
          <>
            {workspaceQueryResult.data?.workspace?.members?.length ? (
              <AvatarGroup
                max={hasEditorSidebar ? 3 : 2}
                _avatar={{ size: "sm" }}
              >
                {workspaceQueryResult.data.workspace.members.map((member) => {
                  return (
                    <Avatar
                      key={member.userId}
                      color={hashToCollaboratorColor(member.userId)}
                    >
                      {member.username?.split("@")[0].substring(0, 2)}
                    </Avatar>
                  );
                })}
              </AvatarGroup>
            ) : null}

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
                  size="xl"
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
