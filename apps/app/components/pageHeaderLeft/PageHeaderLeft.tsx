import { tw, View, IconButton, useHasEditorSidebar } from "@serenity-tools/ui";
import React from "react";
import { DrawerActions } from "@react-navigation/native";

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
        size={hasEditorSidebar ? "lg" : "md"}
      />
    </View>
  );
}
