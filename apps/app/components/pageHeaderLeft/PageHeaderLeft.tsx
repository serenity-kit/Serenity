import {
  tw,
  View,
  IconButton,
  useHasEditorSidebar,
  Text,
  Icon,
  useIsPermanentLeftSidebar,
} from "@serenity-tools/ui";
import React from "react";
import { DrawerActions } from "@react-navigation/native";
import { useEditorStore } from "../../utils/editorStore/editorStore";
import { HStack } from "native-base";
import { useDocumentPathStore } from "../../utils/document/documentPathStore";
import { useDocumentStore } from "../../utils/document/documentStore";

export function PageHeaderLeft(props: any) {
  const documentPathList = useDocumentPathStore((state) => state.folders);
  const { getName } = useDocumentPathStore();
  const document = useDocumentStore((state) => state.document);
  const documentName = useDocumentStore((state) => state.documentName);
  const isPermanentLeftSidebar = useIsPermanentLeftSidebar();
  const hasEditorSidebar = useHasEditorSidebar();
  const isInEditingMode = useEditorStore((state) => state.isInEditingMode);

  // TODO styling depending on if going back/forward is possible
  const actionIsPossible = true;

  return (
    <HStack alignItems={"center"}>
      {!isPermanentLeftSidebar ? (
        <View style={hasEditorSidebar ? tw`pl-2` : tw`pl-3`}>
          {isInEditingMode ? (
            <HStack>
              <IconButton
                size={"lg"}
                name="arrow-go-back-line"
                // TODO
                color={actionIsPossible ? "gray-800" : "gray-400"}
              ></IconButton>
              <IconButton size={"lg"} name="arrow-go-forward-line"></IconButton>
            </HStack>
          ) : (
            <IconButton
              onPress={() => {
                props.navigation.dispatch(DrawerActions.openDrawer());
              }}
              name="arrow-left-line"
              color={"gray-900"}
              size={hasEditorSidebar ? "lg" : "md"}
              style={hasEditorSidebar ? tw`-mr-3` : tw``}
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
          {document ? (
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
