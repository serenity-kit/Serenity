import * as React from "react";
import { tw } from "../../tailwind";
import { Link as ReactNavigationLink } from "@react-navigation/native";
import type { NavigationAction } from "@react-navigation/core";
import { GestureResponderEvent, TextProps } from "react-native";
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
});

export function Link<ParamList extends ReactNavigation.RootParamList>(
  props: Props<ParamList>
) {
  return (
    <ReactNavigationLink
      {...props}
      // @ts-expect-error allow style overwrite
      style={tw.style(
        `text-primary-500 dark:text-primary-500 underline`,
        props.style
      )}
    />
  );
}
