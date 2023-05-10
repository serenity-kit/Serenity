import {
  Badge,
  IconButton,
  Text,
  Tooltip,
  View,
  tw,
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
  const offlineState = useEditorStore((state) => state.offlineState);
  const isDesktopDevice = useIsDesktopDevice();

  return (
    <HStack alignItems={"center"}>
      {isInEditingMode && !isDesktopDevice ? (
        <Text variant="xs" muted>
          Editing mode
        </Text>
      ) : null}

      {offlineState ? (
        <Tooltip
          label={`${offlineState.pendingChanges} edits will be synced the next time you are online`}
          placement="bottom"
          offset={8}
          openDelay={200}
        >
          {/* needs a view since the tooltip placement needs a block element */}
          <View>
            <Badge variant="xs" style={tw`mr-4`}>
              Offline
            </Badge>
          </View>
        </Tooltip>
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
          />
        </Tooltip>
      ) : null}
    </HStack>
  );
};
