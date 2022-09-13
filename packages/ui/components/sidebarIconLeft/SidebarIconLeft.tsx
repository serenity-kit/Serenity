import React, { forwardRef } from "react";
import { Icon, IconNames, IconProps } from "../icon/Icon";
import { useIsDesktopDevice } from "../../hooks/useIsDesktopDevice/useIsDesktopDevice";

export type SidebarIconLeftProps = IconProps & {
  name: IconNames;
};

export const SidebarIconLeft = forwardRef(
  (props: SidebarIconLeftProps, ref) => {
    const isDesktopDevice = useIsDesktopDevice();

    return (
      <Icon
        name={props.name}
        color={isDesktopDevice ? "gray-800" : "gray-900"}
      />
    );
  }
);
