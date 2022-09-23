import React, { forwardRef } from "react";
import { Icon } from "../icon/Icon";
import { ViewProps } from "../view/View";

export type SidebarIconNavRightProps = ViewProps & {};

export const SidebarIconNavRight = forwardRef(
  (props: SidebarIconNavRightProps, ref) => {
    return <Icon name="arrow-right-s-line" color={"gray-900"} />;
  }
);
