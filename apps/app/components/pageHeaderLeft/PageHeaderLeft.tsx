import { tw, Pressable, Icon } from "@serenity-tools/ui";
import React from "react";
import { DrawerActions } from "@react-navigation/native";

export function PageHeaderLeft(props: any) {
  return (
    <Pressable
      style={[tw`pl-6`]}
      onPress={() => {
        props.navigation.dispatch(DrawerActions.openDrawer());
      }}
    >
      <Icon name="menu" />
    </Pressable>
  );
}
