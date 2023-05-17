import React from "react";
import { StyleSheet } from "react-native";
import { tw } from "../../tailwind";
import { Text, TextProps } from "../text/Text";

export type TagProps = TextProps & {
  purpose?: "info" | "error";
};

export function Tag(props: TagProps) {
  const { purpose = "info", ...textProps } = props;
  const styles = StyleSheet.create({
    badge: tw.style(`border rounded-full px-2 py-1 `),
    info: tw`border-gray-800`,
    error: tw`text-error-500 border-error-500`,
  });

  return (
    <Text
      {...textProps}
      style={[
        styles.badge,
        props.style,
        purpose === "error" ? styles.error : styles.info,
      ]}
    />
  );
}
