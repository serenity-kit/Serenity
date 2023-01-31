import { IInputProps, Input as NbInput } from "native-base";
import React, { forwardRef } from "react";
import { StyleSheet } from "react-native";
import { useIsEqualOrLargerThanBreakpoint } from "../../hooks/useIsEqualOrLargerThanBreakpoint/useIsEqualOrLargerThanBreakpoint";
import { tw } from "../../tailwind";

export type RawInputProps = IInputProps & {};

export const RawInput = forwardRef((props: RawInputProps, ref) => {
  const isEqualOrLargerThanXS = useIsEqualOrLargerThanBreakpoint("xs");

  // only the necessary styles are defined here, the basic Input stylings are in App.tsx to override the
  // native-base stylings as the Input is also used internally in their Select component
  const styles = StyleSheet.create({
    input: tw`${isEqualOrLargerThanXS ? "text-xs" : "text-input"}`,
  });

  return (
    <NbInput
      // @ts-ignore
      ref={ref}
      {...props}
      style={[styles.input, props.style]}
    />
  );
});
