import { IInputProps, Input as NbInput } from "native-base";
import React, { forwardRef } from "react";
import { StyleSheet } from "react-native";
import { tw } from "../../tailwind";

export type RawInputProps = IInputProps & {};

export const RawInput = forwardRef((props: RawInputProps, ref) => {
  const styles = StyleSheet.create({
    wrapper: tw`h-form-element rounded`,
    input: tw`px-4 flex justify-center text-input font-input text-gray-900 `,
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
            tw`bg-white border-primary-500 se-outline-focus`,
          ],
        },
        _hover: {
          _stack: {
            style: [
              styles.wrapper,
              tw`bg-white border-primary-500 se-outline-focus`,
            ],
          },
        },
      }}
    />
  );
});
