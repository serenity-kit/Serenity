import * as React from "react";
import { Platform, Pressable } from "react-native";
import { tw } from "../../tailwind";
import { useLinkProps } from "@react-navigation/native";
import type { NavigationAction } from "@react-navigation/core";
import { GestureResponderEvent, TextProps, StyleSheet } from "react-native";
import { To } from "@react-navigation/native/lib/typescript/src/useLinkTo";
import { useFocusRing } from "@react-native-aria/focus";
import { HStack } from "native-base";
import { useIsDesktopDevice } from "../../hooks/useIsDesktopDevice/useIsDesktopDevice";
import { SidebarIconNavRight } from "../sidebarIconNavRight/SidebarIconNavRight";
import { SidebarText } from "../sidebarText/SidebarText";

// copied from react-navigation type definitions
declare type MenuLinkProps<ParamList extends ReactNavigation.RootParamList> = {
  to: To<ParamList>;
  action?: NavigationAction;
  target?: string;
  onPress?: (
    e: React.MouseEvent<HTMLAnchorElement, MouseEvent> | GestureResponderEvent
  ) => void;
} & (TextProps & {
  children: React.ReactNode;
  icon?: React.ReactNode;
});

export function MenuLink<ParamList extends ReactNavigation.RootParamList>(
  props: MenuLinkProps<ParamList>
) {
  const isDesktopDevice = useIsDesktopDevice();
  const [isHovered, setIsHovered] = React.useState(false);
  const { isFocusVisible, focusProps: focusRingProps }: any = useFocusRing();
  const linkProps = useLinkProps({
    ...props,
  });

  const styles = StyleSheet.create({
    link:
      tw.style(Platform.OS === "web" && { outlineWidth: 0 }) &&
      tw`pl-5 md:pl-3`,
    stack: tw.style(`py-3 md:py-2 pr-4 md:pr-3`), // flex needed for correct height calculation
    hover: tw`bg-gray-200`,
    focusVisible: Platform.OS === "web" ? tw`se-inset-focus-mini` : {},
  });

  return (
    <Pressable
      {...linkProps}
      {...props}
      {...focusRingProps} // sets onFocus and onBlur
      onPress={(event) => {
        if (props.onPress) {
          props.onPress(event);
        }
        linkProps.onPress(event);
      }}
      style={[
        styles.link,
        isHovered && styles.hover,
        isFocusVisible && styles.focusVisible,
      ]}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <HStack space={isDesktopDevice ? 2 : 4} alignItems="center">
        {props.icon}
        <HStack
          alignItems={"center"}
          justifyContent={"space-between"}
          style={[
            styles.stack,
            !isDesktopDevice && tw`border-b border-gray-200`,
            tw`flex-auto`,
          ]}
          space={4}
        >
          <SidebarText>{props.children}</SidebarText>
          {!isDesktopDevice ? <SidebarIconNavRight /> : null}
        </HStack>
      </HStack>
    </Pressable>
  );
}
