import * as React from "react";
import { TextProps } from "react-native";
import { useFocusRing } from "@react-native-aria/focus";
import { Pressable } from "../pressable/Pressable";
import { createLinkStyles } from "../link/Link";

export type LinkButtonProps = TextProps & {
  children: React.ReactNode;
};

export function LinkButton(props: LinkButtonProps) {
  const { isFocusVisible, focusProps: focusRingProps } = useFocusRing();
  const styles = createLinkStyles();

  return (
    <Pressable
      {...props}
      {...focusRingProps} // sets onFocus and onBlur
      style={[
        styles.default,
        isFocusVisible && styles.focusVisible,
        props.style,
      ]}
    />
  );
}
