import React, { forwardRef } from "react";
import { Icon, IconNames, IconProps } from "../icon/Icon";
import { useIsDesktopDevice } from "../../hooks/useIsDesktopDevice/useIsDesktopDevice";

export type SidebarIconLeftProps = IconProps & {
  name: IconNames;
  active?: boolean;
};

export const SidebarIconLeft = forwardRef(
  (props: SidebarIconLeftProps, ref) => {
    const { name, active } = props;
    const isDesktopDevice = useIsDesktopDevice();

    const iconColor = active ? "primary-500" : "gray-800";

    return (
      <Icon name={name} color={isDesktopDevice ? iconColor : "gray-900"} />
    );
  }
);
