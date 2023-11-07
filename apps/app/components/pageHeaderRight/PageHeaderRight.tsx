import { generateId } from "@serenity-tools/common";
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
import { getLocalUserByDeviceSigningPublicKey } from "../../store/userStore";
import { useLocalLastWorkspaceChainEvent } from "../../store/workspaceChainStore";
import { useEditorStore } from "../../utils/editorStore/editorStore";
import PageHeaderRightMenu from "../pageHeaderRightMenu/PageHeaderRightMenu";
import { PageShareModalContent } from "../pageShareModalContent/PageShareModalContent";

type Props = {
  toggleCommentsDrawer: () => void;
  hasShareButton: boolean;
};

export const PageHeaderRight: React.FC<Props> = ({
  toggleCommentsDrawer,
  hasShareButton,
}) => {
  const hasEditorSidebar = useHasEditorSidebar();
  const { workspaceId } = useWorkspace();
  const lastWorkspaceChainEvent = useLocalLastWorkspaceChainEvent({
    workspaceId,
  });
  const [isActiveShareModal, setIsActiveShareModal] = useState(false);
  const isInEditingMode = useEditorStore((state) => state.isInEditingMode);
  const triggerBlur = useEditorStore((state) => state.triggerBlur);

  const activeWorkspaceMembers = lastWorkspaceChainEvent?.state.members
    ? Object.entries(lastWorkspaceChainEvent.state.members).map(
        ([mainDeviceSigningPublicKey, member]) => {
          const user = getLocalUserByDeviceSigningPublicKey({
            signingPublicKey: mainDeviceSigningPublicKey,
          });
          return user;
        }
      )
    : null;

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
            {activeWorkspaceMembers ? (
              <AvatarGroup
                max={hasEditorSidebar ? 3 : 2}
                _avatar={{ size: "sm" }}
              >
                {activeWorkspaceMembers.map((member) => {
                  if (member) {
                    return (
                      <Avatar
                        key={member.id}
                        color={hashToCollaboratorColor(member.id)}
                      >
                        {member.username?.split("@")[0].substring(0, 1)}
                      </Avatar>
                    );
                  }
                  // we need to load the user - currently it is unknown
                  const id = generateId();
                  return (
                    <Avatar key={id} color="rose">
                      U
                    </Avatar>
                  );
                })}
              </AvatarGroup>
            ) : null}

            {hasEditorSidebar ? (
              <>
                {hasShareButton ? (
                  <Button
                    size="sm"
                    onPress={() => {
                      setIsActiveShareModal(true);
                    }}
                    testID="document-share-button"
                  >
                    Share
                  </Button>
                ) : null}
              </>
            ) : (
              <PageHeaderRightMenu
                onSharePressed={() => {
                  setIsActiveShareModal(true);
                }}
                onCommentsPressed={() => {
                  toggleCommentsDrawer();
                }}
                hasShareButton={hasShareButton}
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
