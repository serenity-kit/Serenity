import React, { useState } from "react";
import { StyleSheet } from "react-native";
import { tw } from "../../tailwind";
import { RawInput, RawInputProps } from "../rawInput/RawInput";
import { Text } from "../text/Text";
import { View } from "../view/View";

export type InputProps = RawInputProps & {
  label: string;
  hint?: string;
};

export const Input = React.forwardRef(({ ...props }: InputProps, ref: any) => {
  const [isFocused, setIsFocused] = useState(false);
  const styles = StyleSheet.create({
    default: tw`text-base text-gray-900 dark:text-white`,
    focus: tw`text-primary-500`,
    disabled: tw`text-muted`,
    error: tw`text-error-500`,
    hint: tw`mt-3`,
  });

  return (
    <View style={[styles.default, props.style]}>
      <Text
        variant="xs"
        muted
        style={[
          tw`mb-1`,
          props.isDisabled && styles.disabled,
          isFocused && styles.focus,
        ]}
      >
        {props.label}
      </Text>
      <RawInput
        {...props}
        ref={ref}
        onFocus={() => {
          setIsFocused(true);
        }}
        onBlur={() => {
          setIsFocused(false);
        }}
      />
      {props.hint && (
        <Text variant="xxs" bold muted style={styles.hint}>
          {props.hint}
        </Text>
      )}
    </View>
  );
});
