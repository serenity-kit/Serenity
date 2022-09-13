import React, { forwardRef } from "react";
import { Icon } from "../icon/Icon";
import { View, ViewProps } from "../view/View";
import { tw } from "../../tailwind";

export type SidebarIconNavRightProps = ViewProps & {};

export const SidebarIconNavRight = forwardRef(
  (props: SidebarIconNavRightProps, ref) => {
    return (
      <View style={tw`ml-auto`}>
        <Icon name="arrow-right-s-line" color={"gray-900"} />
      </View>
    );
  }
);
