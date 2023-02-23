import { useNavigation } from "@react-navigation/native";
import { IconButton, Text, tw, useIsDesktopDevice } from "@serenity-tools/ui";
import { HStack } from "native-base";
import { useEditorStore } from "../../utils/editorStore/editorStore";

type Props = {
  toggleCommentsDrawer: () => void;
};

export const PageHeader: React.FC<Props> = ({ toggleCommentsDrawer }) => {
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
      <IconButton
        onPress={() => {
          toggleCommentsDrawer();
        }}
        name="chat-4-line"
        color={"gray-900"}
        size={isDesktopDevice ? "md" : "xl"}
        style={isDesktopDevice ? tw`` : tw`-mr-3`}
      />
    </>
  );
};
