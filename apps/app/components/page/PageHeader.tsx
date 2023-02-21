import { useNavigation } from "@react-navigation/native";
import {
  IconButton,
  Text,
  Tooltip,
  useIsDesktopDevice,
} from "@serenity-tools/ui";
import { HStack } from "native-base";
import { useEditorStore } from "../../utils/editorStore/editorStore";

export const PageHeader: React.FC<{}> = () => {
  const isInEditingMode = useEditorStore((state) => state.isInEditingMode);
  const isDesktopDevice = useIsDesktopDevice();
  const navigation = useNavigation();

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
        <IconButton
          onPress={() => {
            // @ts-ignore
            navigation.openDrawer();
          }}
          name="chat-4-line"
          color={"gray-800"}
          size={"lg"}
        />
      ) : null}
    </>
  );
};
