import { tw, View, IconButton } from "@serenity-tools/ui";
import React from "react";
import { DrawerActions } from "@react-navigation/native";
import { useHasEditorSidebar } from "@serenity-tools/editor/hooks/useHasEditorSidebar";

export function PageHeaderLeft(props: any) {
  const hasEditorSidebar = useHasEditorSidebar();

  return (
    <View style={[tw`pl-3`]}>
      <IconButton
        onPress={() => {
          props.navigation.dispatch(DrawerActions.openDrawer());
        }}
        name="double-arrow-right"
        color={"gray-800"}
        large={hasEditorSidebar}
      ></IconButton>
    </View>
  );
}
