import { useFocusRing } from "@react-native-aria/focus";
import * as React from "react";
import { createLinkStyles } from "../link/Link";
import { Pressable, PressableProps } from "../pressable/Pressable";
import { Text, TextVariants } from "../text/Text";

export type LinkButtonProps = PressableProps & {
  children: React.ReactNode;
  variant?: TextVariants;
  quiet?: boolean;
};

export function LinkButton(props: LinkButtonProps) {
  const { variant = "xs", quiet } = props;
  const { isFocusVisible, focusProps: focusRingProps } = useFocusRing();
  const styles = createLinkStyles();

  return (
    <Pressable
      {...props}
      {...focusRingProps} // sets onFocus and onBlur
      style={(isFocusVisible && styles.focusVisible, props.style)}
    >
      <Text
        variant={variant}
        style={[styles.default, !quiet && styles.primary]}
      >
        {props.children}
      </Text>
    </Pressable>
  );
}
