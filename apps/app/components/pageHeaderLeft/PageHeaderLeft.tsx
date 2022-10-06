import { DrawerActions } from "@react-navigation/native";
import {
  Icon,
  IconButton,
  Text,
  tw,
  useHasEditorSidebar,
  useIsDesktopDevice,
  useIsPermanentLeftSidebar,
  View,
} from "@serenity-tools/ui";
import { HStack } from "native-base";
import { useWindowDimensions } from "react-native";
import { useActiveDocumentInfoStore } from "../../utils/document/activeDocumentInfoStore";
import { useDocumentPathStore } from "../../utils/document/documentPathStore";
import { useEditorStore } from "../../utils/editorStore/editorStore";

export function PageHeaderLeft(props: any) {
  useWindowDimensions(); // needed to ensure tw-breakpoints are triggered when resizing
  const documentPathList = useDocumentPathStore((state) => state.folders);
  const { getName } = useDocumentPathStore();
  const documentName = useActiveDocumentInfoStore(
    (state) => state.documentName
  );
  const isPermanentLeftSidebar = useIsPermanentLeftSidebar();
  const hasEditorSidebar = useHasEditorSidebar();
  const isDesktopDevice = useIsDesktopDevice();
  const isInEditingMode = useEditorStore((state) => state.isInEditingMode);

  // TODO disable IconButton depending on if going back/forward is possible
  const actionIsNotPossible = true;

  return (
    <HStack alignItems={"center"}>
      {!isPermanentLeftSidebar ? (
        <View style={isDesktopDevice ? tw`pl-3` : tw`pl-2`}>
          {isInEditingMode ? (
            <HStack>
              <IconButton
                size={"lg"}
                name="arrow-go-back-line"
                color={"gray-900"}
              ></IconButton>
              <IconButton
                size={"lg"}
                name="arrow-go-forward-line"
                color={"gray-900"}
                // TODO
                disabled={actionIsNotPossible}
              ></IconButton>
            </HStack>
          ) : (
            <IconButton
              onPress={() => {
                props.navigation.dispatch(DrawerActions.openDrawer());
              }}
              name="arrow-left-line"
              color={"gray-900"}
              size={isDesktopDevice ? "md" : "lg"}
              style={isDesktopDevice ? tw`` : tw`-mr-3`}
            />
          )}
        </View>
      ) : null}
      {!isInEditingMode ? (
        <HStack
          space={0.5}
          alignItems="center"
          style={isPermanentLeftSidebar ? tw`pl-7` : tw`pl-4.5`}
        >
          {hasEditorSidebar ? (
            documentPathList.map((folder) => (
              <HStack key={folder.id} alignItems="center" space={0.5}>
                <Text
                  variant="xxs"
                  muted
                  style={tw`max-w-30 2xl:max-w-50`}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {getName(folder.id)}
                </Text>
                <Icon name="arrow-right-s-line" color={"gray-600"} />
              </HStack>
            ))
          ) : (
            <Text variant="xxs" muted>
              ... /
            </Text>
          )}
          {documentName ? (
            <Text
              variant="xxs"
              bold={hasEditorSidebar}
              style={tw`max-w-35 sm:max-w-40 md:max-w-50 2xl:max-w-70`}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {documentName}
            </Text>
          ) : null}
        </HStack>
      ) : null}
    </HStack>
  );
}
