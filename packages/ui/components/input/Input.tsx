import React, { forwardRef } from "react";
import { StyleSheet } from "react-native";
import { Input as NbInput, IInputProps } from "native-base";
import { tw } from "../../tailwind";

export type InputProps = IInputProps & {};

export const Input = forwardRef((props: InputProps, ref) => {
  const styles = StyleSheet.create({
    wrapper: tw`rounded`,
    input: tw`text-base text-gray-900 px-4 py-3`,
  });

  return (
    <NbInput
      // @ts-ignore
      ref={ref}
      {...props}
      style={[styles.input, props.disabled && tw`text-muted`]}
      _stack={{
        style: props.disabled
          ? [styles.wrapper, tw`bg-gray-100 border-gray-400`]
          : [styles.wrapper, tw`bg-white border-gray-400`],
      }}
      _hover={{
        _stack: {
          style: props.disabled
            ? [styles.wrapper, tw`bg-gray-100 border-gray-400`]
            : [styles.wrapper, tw`bg-white border-gray-600`],
        },
      }}
      _focus={{
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
