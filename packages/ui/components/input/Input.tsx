import React, { useState } from "react";
import { StyleSheet } from "react-native";
import { tw } from "../../tailwind";
import { RawInput, RawInputProps, RawInputSize } from "../rawInput/RawInput";
import { Text } from "../text/Text";
import { View } from "../view/View";
import { HStack } from "native-base";

export type InputProps = RawInputProps & {
  label: string;
  hint?: string;
  helperText?: string;
  size?: RawInputSize;
};

export const Input = React.forwardRef(({ ...props }: InputProps, ref: any) => {
  const { helperText } = props;

  const [isFocused, setIsFocused] = useState(false);
  const styles = StyleSheet.create({
    default: tw``,
    focus: tw`text-primary-500`,
    disabled: tw`text-muted`,
    error: tw`text-error-500`,
    hint: tw`mt-3`,
    helperText: props.isInvalid ? tw`text-error-500` : tw`text-primary-500`,
  });

  return (
    <View style={[styles.default, props.style]}>
      <HStack
        style={tw`mb-1`}
        justifyContent="space-between"
        alignItems="center"
      >
        <Text
          variant="xs"
          muted
          bold
          style={[
            props.isDisabled && styles.disabled,
            isFocused && styles.focus,
            props.isInvalid && styles.error,
          ]}
        >
          {props.label}
        </Text>
        {helperText && isFocused ? (
          <Text variant="xxs" style={styles.helperText} bold>
            {helperText}
          </Text>
        ) : null}
      </HStack>
      <RawInput
        {...props}
        ref={ref}
        onFocus={() => {
          setIsFocused(true);
        }}
        onBlur={() => {
          setIsFocused(false);
        }}
        size={props.size}
      />
      {props.hint && (
        <Text variant="xxs" bold muted style={styles.hint}>
          {props.hint}
        </Text>
      )}
    </View>
  );
});
