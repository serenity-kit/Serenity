import * as React from "react";
import { tw } from "../../tailwind";
import { Link as ReactNavigationLink } from "@react-navigation/native";
import type { NavigationAction } from "@react-navigation/core";
import { GestureResponderEvent, TextProps, StyleSheet } from "react-native";
import { To } from "@react-navigation/native/lib/typescript/src/useLinkTo";
import { useFocusRing } from "@react-native-aria/focus";

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
});

export function Link<ParamList extends ReactNavigation.RootParamList>(
  props: Props<ParamList>
) {
  const { isFocusVisible, focusProps: focusRingProps } = useFocusRing();

  const styles = StyleSheet.create({
    // reset outline for web focusVisible
    default: tw.style(`text-primary-500 underline`, { outlineWidth: 0 }),
    focusVisible: tw`se-outline-focus-mini rounded`,
  });

  return (
    <ReactNavigationLink
      {...props}
      {...focusRingProps} // sets onFocus and onBlur
      style={[
        styles.default,
        props.style,
        isFocusVisible && styles.focusVisible,
      ]}
    />
  );
}
