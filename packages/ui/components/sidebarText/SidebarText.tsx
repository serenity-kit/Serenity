import React, { forwardRef } from "react";
import { useIsDesktopDevice } from "../../hooks/useIsDesktopDevice/useIsDesktopDevice";
import { Text, TextProps } from "../text/Text";

export type SidebarTextProps = TextProps & {};

export const SidebarText = forwardRef((props: SidebarTextProps, ref) => {
  const isDesktopDevice = useIsDesktopDevice();

  return (
    <Text variant={isDesktopDevice ? "xs" : "md"} {...props}>
      {props.children}
    </Text>
  );
});
