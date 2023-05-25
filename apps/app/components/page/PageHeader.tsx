import {
  IconButton,
  Tag,
  Text,
  Tooltip,
  View,
  tw,
  useHasEditorSidebar,
  useIsDesktopDevice,
} from "@serenity-tools/ui";
import { HStack } from "native-base";
import { useEditorStore } from "../../utils/editorStore/editorStore";

type Props = {
  toggleCommentsDrawer: () => void;
  isOpenSidebar: boolean;
  hasNewComment: boolean;
};

export const PageHeader: React.FC<Props> = ({
  toggleCommentsDrawer,
  isOpenSidebar,
  hasNewComment,
}) => {
  const isInEditingMode = useEditorStore((state) => state.isInEditingMode);
  const syncState = useEditorStore((state) => state.syncState);
  const documentState = useEditorStore((state) => state.documentState);
  const isDesktopDevice = useIsDesktopDevice();
  const hasEditorSidebar = useHasEditorSidebar();

  return (
    <HStack alignItems={"center"}>
      {isInEditingMode && !isDesktopDevice ? (
        <Text variant="xs" muted>
          Editing mode
        </Text>
      ) : null}

      {hasEditorSidebar && syncState.variant === "offline" ? (
        <Tooltip
          label={`${syncState.pendingChanges} edits will be synced the next time you are online`}
          placement="bottom"
          offset={8}
          openDelay={200}
        >
          {/* needs a view since the tooltip placement needs a block element */}
          <View>
            <Tag variant="xs" style={tw`mr-2`}>
              Offline
            </Tag>
          </View>
        </Tooltip>
      ) : null}

      {hasEditorSidebar && syncState.variant === "error" ? (
        <Tag purpose="error" variant="xs" style={tw`mr-2`}>
          {syncState.documentDecryptionState === "complete" ||
          syncState.documentLoadedFromLocalDb
            ? "Failed to apply updates"
            : "Failed to load the page"}
        </Tag>
      ) : null}

      {isDesktopDevice ? (
        <Tooltip
          label="Toggle Comments"
          placement="left"
          offset={8}
          openDelay={1200}
        >
          <IconButton
            onPress={() => {
              toggleCommentsDrawer();
            }}
            isActive={isOpenSidebar}
            name={hasNewComment ? "chat-4-line-dot" : "chat-4-line"}
            size={"lg"}
            testID="open-comments-drawer-button"
            disabled={documentState === "loading"}
          />
        </Tooltip>
      ) : null}
    </HStack>
  );
};
