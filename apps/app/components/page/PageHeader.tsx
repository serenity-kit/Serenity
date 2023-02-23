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
};

export const PageHeader: React.FC<Props> = ({ toggleCommentsDrawer }) => {
  const isInEditingMode = useEditorStore((state) => state.isInEditingMode);
  const isDesktopDevice = useIsDesktopDevice();

  return (
    <>
      {isInEditingMode && !isDesktopDevice ? (
        <HStack alignItems={"center"}>
          <Text variant="xs" muted>
            Editing mode
          </Text>
        </HStack>
      ) : null}
      {isDesktopDevice ? (
        <Tooltip label="Toggle Comments" placement="left" offset={8}>
          <IconButton
            onPress={() => {
              toggleCommentsDrawer();
            }}
            name="chat-4-line"
            color={"gray-800"}
            size={"lg"}
          />
        </Tooltip>
      ) : null}
    </>
  );
};
