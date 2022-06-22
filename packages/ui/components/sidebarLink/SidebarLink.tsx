import * as React from "react";
import { Platform } from "react-native";
import { tw } from "../../tailwind";
import { Link as ReactNavigationLink } from "@react-navigation/native";
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

  const styles = StyleSheet.create({
    default: tw.style(
      `px-4 py-1.5`,
      Platform.OS === "web" && { outlineWidth: 0 }
    ),
    hover: tw`bg-gray-200`,
    focusVisible: Platform.OS === "web" ? tw`se-inset-focus-mini` : {},
  });

  return (
    <ReactNavigationLink
      {...props}
      {...focusRingProps} // sets onFocus and onBlur
      style={[
        styles.default,
        isHovered && styles.hover,
        isFocusVisible && styles.focusVisible,
        props.style,
      ]}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* flex needed for correct height calculation */}
      <HStack space={2} alignItems="center" style={tw`flex`}>
        {props.children}
      </HStack>
    </ReactNavigationLink>
  );
}
