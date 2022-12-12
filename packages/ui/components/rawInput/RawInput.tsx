import { IInputProps, Input as NbInput } from "native-base";
import React, { forwardRef } from "react";
import { StyleSheet } from "react-native";
import { useIsEqualOrLargerThanBreakpoint } from "../../hooks/useIsEqualOrLargerThanBreakpoint/useIsEqualOrLargerThanBreakpoint";
import { tw } from "../../tailwind";

export type RawInputSize = "md" | "lg";

export type RawInputProps = IInputProps & {
  size?: RawInputSize;
};

export const RawInput = forwardRef((props: RawInputProps, ref) => {
  const isEqualOrLargerThanXS = useIsEqualOrLargerThanBreakpoint("xs");
  const { size = isEqualOrLargerThanXS ? "md" : "lg" } = props;

  const styles = StyleSheet.create({
    wrapper: tw`rounded ${size == "md" ? "h-10" : "h-form-element"}`,
    input: tw`px-4 flex justify-center font-input text-gray-900 ${
      size == "md" ? "text-xs" : "text-input"
    }`,
  });

  return (
    <NbInput
      // @ts-ignore
      ref={ref}
      {...props}
      style={[styles.input, props.isDisabled && tw`text-muted`, props.style]}
      _stack={{
        style: props.isDisabled
          ? [styles.wrapper, tw`bg-gray-100 border-gray-400`]
          : [styles.wrapper, tw`bg-white border-gray-400`],
      }}
      _hover={{
        _stack: {
          style: props.isDisabled
            ? [styles.wrapper, tw`bg-gray-100 border-gray-400`]
            : [styles.wrapper, tw`bg-white border-gray-600`],
        },
      }}
      _focus={{
        _web: {
          style: [
            styles.input,
            props.isDisabled && tw`text-muted`,
            { outlineStyle: "none" },
            props.style,
          ],
        },
        _stack: {
          style: [
            styles.wrapper,
            tw`bg-white border-primary-400 se-outline-focus-input`,
          ],
        },
        _hover: {
          _stack: {
            style: [
              styles.wrapper,
              tw`bg-white border-primary-400 se-outline-focus-input`,
            ],
          },
        },
      }}
      _invalid={{
        _stack: {
          style: [styles.wrapper, tw`bg-white border-error-500`],
        },
        _hover: {
          _stack: {
            style: [styles.wrapper, tw`bg-white border-error-500`],
          },
        },
        _focus: {
          _stack: {
            style: [
              styles.wrapper,
              tw`bg-white border-error-500 se-outline-error-input`,
            ],
          },
          _hover: {
            _stack: {
              style: [
                styles.wrapper,
                tw`bg-white border-error-500 se-outline-error-input`,
              ],
            },
          },
        },
      }}
    />
  );
});
