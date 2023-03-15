import React, { useState } from "react";
import { StyleSheet } from "react-native";
import { TextArea, TextAreaProps } from "../textArea/TextArea";
import { tw } from "../../tailwind";

export type ReplyAreaProps = TextAreaProps & {};

export const ReplyArea = (props: ReplyAreaProps) => {
  const { value, minRows = 2 } = props;

  const [isFocused, setIsFocused] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const isActive = isFocused || value !== "";

  const styles = StyleSheet.create({
    default: tw`border border-solid border-transparent`,
    hover: tw`bg-gray-200 border border-solid border-gray-200`,
  });

  return (
    <TextArea
      {...props}
      placeholder={"Reply..."}
      placeholderTextColor={
        isHovered || isFocused ? tw.color("gray-600") : tw.color("gray-500")
      }
      minRows={isActive ? minRows : 1}
      variant={isActive ? "outline" : "unstyled"}
      style={[
        !isActive && !isHovered && styles.default,
        !isActive && isHovered && styles.hover,
      ]}
      onFocus={() => {
        setIsFocused(true);
      }}
      onBlur={() => {
        setIsFocused(false);
      }}
      // @ts-expect-error
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    />
  );
};
