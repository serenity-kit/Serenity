import * as React from "react";
import { Platform, Pressable } from "react-native";
import { tw } from "../../tailwind";
import { useLinkProps } from "@react-navigation/native";
import type { NavigationAction } from "@react-navigation/core";
import { GestureResponderEvent, TextProps, StyleSheet } from "react-native";
import { To } from "@react-navigation/native/lib/typescript/src/useLinkTo";
import { useFocusRing } from "@react-native-aria/focus";
import { HStack } from "native-base";

// copied from react-navigation type definitions
declare type SidebarLinkProps<ParamList extends ReactNavigation.RootParamList> =
  {
    to: To<ParamList>;
    action?: NavigationAction;
    target?: string;
    onPress?: (
      e: React.MouseEvent<HTMLAnchorElement, MouseEvent> | GestureResponderEvent
    ) => void;
  } & (TextProps & {
    children: React.ReactNode;
  });

export function SidebarLink<ParamList extends ReactNavigation.RootParamList>(
  props: SidebarLinkProps<ParamList>
) {
  const [isHovered, setIsHovered] = React.useState(false);
  const { isFocusVisible, focusProps: focusRingProps }: any = useFocusRing();
  const linkProps = useLinkProps({
    ...props,
  });

  const styles = StyleSheet.create({
    link: tw.style(Platform.OS === "web" && { outlineWidth: 0 }),
    stack: tw.style(`flex px-4 py-1.5`), // flex needed for correct height calculation
    hover: tw`bg-gray-200`,
    focusVisible: Platform.OS === "web" ? tw`se-inset-focus-mini` : {},
  });

  return (
    <Pressable
      {...linkProps}
      {...props}
      {...focusRingProps} // sets onFocus and onBlur
      style={[
        styles.link,
        isHovered && styles.hover,
        isFocusVisible && styles.focusVisible,
      ]}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <HStack space={2} alignItems="center" style={[styles.stack, props.style]}>
        {props.children}
      </HStack>
    </Pressable>
  );
}
