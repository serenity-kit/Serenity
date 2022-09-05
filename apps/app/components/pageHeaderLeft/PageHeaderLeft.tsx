import { tw, View, IconButton, useHasEditorSidebar } from "@serenity-tools/ui";
import React from "react";
import { DrawerActions } from "@react-navigation/native";
import { useEditorStore } from "../../utils/editorStore/editorStore";
import { HStack } from "native-base";

export function PageHeaderLeft(props: any) {
  const hasEditorSidebar = useHasEditorSidebar();
  const isInEditingMode = useEditorStore((state) => state.isInEditingMode);

  // TODO styling depending on if going back/forward is possible
  const actionIsPossible = true;

  return (
    <View style={[tw`pl-3`]}>
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
        />
      )}
    </View>
  );
}
