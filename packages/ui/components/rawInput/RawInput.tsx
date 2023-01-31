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

  return (
    <NbInput
      // @ts-ignore
      ref={ref}
      {...props}
      paddingX={4}
      display={"flex"}
      justifyContent="center"
      fontFamily={"Inter_400Regular"}
      color={tw.color("gray-900")}
      style={[tw`${size == "md" ? "text-xs" : "text-input"}`, props.style]}
      _disabled={{
        opacity: 0.5,
        color: tw.color("gray-600"),
        _stack: {
          backgroundColor: tw.color("gray-100"),
        },
      }}
      _stack={{
        height: size === "md" ? 10 : 12,
        backgroundColor: "white",
        style: [tw`border-gray-400`],
      }}
      _hover={{
        _stack: {
          style: [tw`border-gray-600`],
        },
        _disabled: {
          _stack: {
            style: [tw`border-gray-400`],
          },
        },
      }}
      _focus={{
        _stack: {
          // background needs to be set here (nb-override)
          style: [tw`bg-white border-primary-400 se-outline-focus-input`],
        },
        _hover: {
          _stack: {
            style: [tw`border-primary-400 se-outline-focus-input`],
          },
        },
      }}
      _invalid={{
        _stack: {
          style: [tw`border-error-500`],
        },
        _hover: {
          _stack: {
            style: [tw`border-error-500`],
          },
        },
        _focus: {
          _stack: {
            style: [tw`border-error-500 se-outline-error-input`],
          },
          _hover: {
            _stack: {
              style: [tw`border-error-500 se-outline-error-input`],
            },
          },
        },
      }}
    />
  );
});
