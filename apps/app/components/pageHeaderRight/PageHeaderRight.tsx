import {
  Avatar,
  AvatarGroup,
  Button,
  hashToCollaboratorColor,
  IconButton,
  Modal,
  tw,
  useHasEditorSidebar,
} from "@serenity-tools/ui";
import { HStack } from "native-base";
import { useState } from "react";
import { useWorkspace } from "../../context/WorkspaceContext";
import { useEditorStore } from "../../utils/editorStore/editorStore";
import PageHeaderRightMenu from "../pageHeaderRightMenu/PageHeaderRightMenu";
import { PageShareModalContent } from "../pageShareModalContent/PageShareModalContent";

type Props = {
  toggleCommentsDrawer: () => void;
};

export const PageHeaderRight: React.FC<Props> = ({ toggleCommentsDrawer }) => {
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
        } pl-3 pr-4 border-b border-gray-200`}
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
            // the prop `transparent` this causes a bug that hides the editor once you focus on the editor in safari (no sure why
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
                      {member.username?.split("@")[0].substring(0, 1)}
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
                testID="document-share-button"
              >
                Share
              </Button>
            ) : (
              <PageHeaderRightMenu
                onSharePressed={() => {
                  setIsActiveShareModal(true);
                }}
                onCommentsPressed={() => {
                  toggleCommentsDrawer();
                }}
              />
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
};
