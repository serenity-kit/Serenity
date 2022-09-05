import { DrawerHeaderProps } from "@react-navigation/drawer";
import { Text } from "@serenity-tools/ui";
import { HStack } from "native-base";
import { useEditorStore } from "../../utils/editorStore/editorStore";

type Props = DrawerHeaderProps & {
  children: any;
};

export function PageHeader(props: Props) {
  const isInEditingMode = useEditorStore((state) => state.isInEditingMode);

  return (
    <>
      {isInEditingMode ? (
        <HStack alignItems={"center"}>
          <Text variant="xs" muted>
            Editing mode
          </Text>
        </HStack>
      ) : null}
    </>
  );
}
