import React, { useState } from "react";
import { StyleSheet } from "react-native";
import { tw } from "../../tailwind";
import { Text, TextProps } from "../text/Text";
import { RawInput, RawInputProps } from "../rawInput/RawInput";
import { View } from "../view/View";

export type LabeledInputProps = RawInputProps & {
  label: string;
  hint?: string;
};

export const LabeledInput = React.forwardRef(
  ({ ...props }: LabeledInputProps, ref: any) => {
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
  }
);
