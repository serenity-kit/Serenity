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
import { useSelector } from "@xstate/react";
import { HStack } from "native-base";
import { useWindowDimensions } from "react-native";
import { editorToolbarService } from "../../machines/editorToolbarMachine";
import { useLocalDocumentName } from "../../store/documentStore";
import { useActiveDocumentStore } from "../../utils/document/activeDocumentStore";
import { useDocumentPathStore } from "../../utils/document/documentPathStore";
import { useEditorStore } from "../../utils/editorStore/editorStore";

const selectCanUndo = (state) => state.context.toolbarState.canUndo;
const selectCanRedo = (state) => state.context.toolbarState.canRedo;

export function PageHeaderLeft(props: any) {
  useWindowDimensions(); // needed to ensure tw-breakpoints are triggered when resizing
  const documentPathList = useDocumentPathStore((state) => state.folders);
  const { getName } = useDocumentPathStore();
  const activeDocumentId = useActiveDocumentStore(
    (state) => state.activeDocumentId
  );
  const activeDocumentTitle = useLocalDocumentName({
    documentId: activeDocumentId || "",
  });
  const isPermanentLeftSidebar = useIsPermanentLeftSidebar();
  const hasEditorSidebar = useHasEditorSidebar();
  const isDesktopDevice = useIsDesktopDevice();
  const isInEditingMode = useEditorStore((state) => state.isInEditingMode);

  const canUndo = useSelector(editorToolbarService, selectCanUndo);
  const canRedo = useSelector(editorToolbarService, selectCanRedo);

  return (
    <HStack alignItems={"center"}>
      {!isPermanentLeftSidebar ? (
        <View style={isDesktopDevice ? tw`pl-3` : tw`pl-2`}>
          {isInEditingMode && !isDesktopDevice ? (
            <HStack>
              <IconButton
                size={"xl"}
                name="arrow-go-back-line"
                color={"gray-900"}
                disabled={!canUndo}
                onPress={() => {
                  editorToolbarService.send("UNDO");
                }}
                // @ts-expect-error
                dataSet={{ editorButton: "true" }}
              ></IconButton>
              <IconButton
                size={"xl"}
                name="arrow-go-forward-line"
                color={"gray-900"}
                disabled={!canRedo}
                onPress={() => {
                  editorToolbarService.send("REDO");
                }}
                // @ts-expect-error
                dataSet={{ editorButton: "true" }}
              ></IconButton>
            </HStack>
          ) : (
            <IconButton
              onPress={() => {
                props.navigation.dispatch(DrawerActions.openDrawer());
              }}
              name="arrow-left-line"
              color={"gray-900"}
              size={isDesktopDevice ? "md" : "xl"}
              style={isDesktopDevice ? tw`` : tw`-mr-3`}
            />
          )}
        </View>
      ) : null}
      {!isInEditingMode || isDesktopDevice ? (
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
          {activeDocumentTitle ? (
            <Text
              variant="xxs"
              bold={hasEditorSidebar}
              style={tw`max-w-35 sm:max-w-40 md:max-w-50 2xl:max-w-70`}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {activeDocumentTitle}
            </Text>
          ) : null}
        </HStack>
      ) : null}
    </HStack>
  );
}
