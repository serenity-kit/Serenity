import {
  IconButton,
  Text,
  Tooltip,
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
  const isOffline = useEditorStore((state) => state.isOffline);
  const isDesktopDevice = useIsDesktopDevice();

  return (
    <HStack alignItems={"center"}>
      {isInEditingMode && !isDesktopDevice ? (
        <Text variant="xs" muted>
          Editing mode
        </Text>
      ) : null}

      {isOffline ? <Text variant="xs">Offline </Text> : null}

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
