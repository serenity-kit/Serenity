import React, { useState } from "react";
import { StyleSheet } from "react-native";
import { TextArea, TextAreaProps } from "../textArea/TextArea";
import { tw } from "../../tailwind";
import { SubmitButton } from "../submitButton/SubmitButton";
import { View } from "../view/View";

export type ReplyAreaProps = TextAreaProps & {
  onSubmitPress: () => void;
  testPrefix?: string;
};

export const ReplyArea = (props: ReplyAreaProps) => {
  const { value, minRows = 2, testPrefix } = props;

  const [isFocused, setIsFocused] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const isEmpty = value === "" || value === undefined;
  const isActive = isFocused || !isEmpty;

  const submitButtonHeight = 7;

  const styles = StyleSheet.create({
    textarea: tw`px-2`,
    default: tw`border border-solid border-transparent`,
    hover: tw`bg-gray-200 border border-solid border-gray-200`,
    submit: tw`absolute h-${submitButtonHeight} w-${submitButtonHeight} bottom-0.5 right-0.5`,
    active: tw`pb-${submitButtonHeight}`,
  });

  return (
    <View style={tw`relative`}>
      <TextArea
        {...props}
        placeholder={"Reply..."}
        placeholderTextColor={
          isHovered || isFocused ? tw.color("gray-600") : tw.color("gray-500")
        }
        minRows={isActive ? minRows : 1}
        unlimited
        variant={isActive ? "outline" : "unstyled"}
        style={[
          styles.textarea,
          !isActive && !isHovered && styles.default,
          !isActive && isHovered && styles.hover,
          isActive && styles.active,
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
        testID={`${testPrefix}__reply-input`}
      />
      {isActive ? (
        <SubmitButton
          disabled={isEmpty}
          size="sm"
          onPress={props.onSubmitPress}
          style={styles.submit}
          testID={`${testPrefix}__save-reply-button`}
        />
      ) : null}
    </View>
  );
};
