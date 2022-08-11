import * as React from "react";
import { useFocusRing } from "@react-native-aria/focus";
import { Pressable, PressableProps } from "../pressable/Pressable";
import { Text, TextVariants } from "../text/Text";
import { createLinkStyles } from "../link/Link";

export type LinkButtonProps = PressableProps & {
  variant?: TextVariants;
};

export function LinkButton(props: LinkButtonProps) {
  const { variant = "xs" } = props;
  const { isFocusVisible, focusProps: focusRingProps } = useFocusRing();
  const styles = createLinkStyles();

  return (
    <Pressable
      {...props}
      {...focusRingProps} // sets onFocus and onBlur
      style={(isFocusVisible && styles.focusVisible, props.style)}
    >
      <Text variant={variant} style={styles.default}>
        {props.children}
      </Text>
    </Pressable>
  );
}
