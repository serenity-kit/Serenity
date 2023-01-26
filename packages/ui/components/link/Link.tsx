import { useFocusRing } from "@react-native-aria/focus";
import type { NavigationAction } from "@react-navigation/core";
import { Link as ReactNavigationLink } from "@react-navigation/native";
import { To } from "@react-navigation/native/lib/typescript/src/useLinkTo";
import * as React from "react";
import {
  GestureResponderEvent,
  Platform,
  StyleSheet,
  TextProps,
} from "react-native";
import { tw } from "../../tailwind";

// copied from react-navigation type definitions
declare type Props<ParamList extends ReactNavigation.RootParamList> = {
  to: To<ParamList>;
  action?: NavigationAction;
  target?: string;
  onPress?: (
    e: React.MouseEvent<HTMLAnchorElement, MouseEvent> | GestureResponderEvent
  ) => void;
} & (TextProps & {
  children: React.ReactNode;
  quiet?: boolean;
});

export const createLinkStyles = () => {
  return StyleSheet.create({
    // reset outline for web focusVisible
    default: tw.style(
      `underline`,
      Platform.OS === "web" && { outlineStyle: "none" }
    ),
    primary: tw`text-primary-500`,
    focusVisible:
      Platform.OS === "web" ? tw`se-outline-focus-mini rounded` : {},
  });
};

export function Link<ParamList extends ReactNavigation.RootParamList>(
  props: Props<ParamList>
) {
  const { isFocusVisible, focusProps: focusRingProps } = useFocusRing();
  const styles = createLinkStyles();

  return (
    <ReactNavigationLink
      {...props}
      {...focusRingProps} // sets onFocus and onBlur
      style={[
        styles.default,
        !props.quiet && styles.primary,
        isFocusVisible && styles.focusVisible,
        props.style,
      ]}
    />
  );
}
