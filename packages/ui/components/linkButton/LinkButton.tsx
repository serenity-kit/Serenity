import * as React from "react";
import { Platform } from "react-native";
import { tw } from "../../tailwind";
import { TextProps, StyleSheet } from "react-native";
import { useFocusRing } from "@react-native-aria/focus";
import { Pressable } from "../pressable/Pressable";

export type LinkButtonProps = TextProps & {
  children: React.ReactNode;
};

export function LinkButton(props: LinkButtonProps) {
  const { isFocusVisible, focusProps: focusRingProps } = useFocusRing();

  const styles = StyleSheet.create({
    // reset outline for web focusVisible
    default: tw.style(
      `text-primary-500 underline`,
      Platform.OS === "web" && { outlineWidth: 0 }
    ),
    focusVisible:
      Platform.OS === "web" ? tw`se-outline-focus-mini rounded` : {},
  });

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
