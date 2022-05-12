import * as React from "react";
import { tw } from "../../tailwind";
import { Link as ReactNavigationLink } from "@react-navigation/native";
import type { NavigationAction } from "@react-navigation/core";
import { GestureResponderEvent, TextProps, StyleSheet } from "react-native";
import { To } from "@react-navigation/native/lib/typescript/src/useLinkTo";

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
  small?: boolean;
});

export function Link<ParamList extends ReactNavigation.RootParamList>(
  props: Props<ParamList>
) {
  const styles = StyleSheet.create({
    default: tw`text-primary-500 dark:text-primary-500 underline`,
    small: tw`small`,
  });

  return (
    <ReactNavigationLink
      {...props}
      style={[
        styles.default,
        props.small ? styles.small : undefined,
        props.style,
      ]}
    />
  );
}
