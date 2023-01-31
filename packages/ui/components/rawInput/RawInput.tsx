import { IInputProps, Input as NbInput } from "native-base";
import React, { forwardRef } from "react";
import { StyleSheet } from "react-native";
import { useIsEqualOrLargerThanBreakpoint } from "../../hooks/useIsEqualOrLargerThanBreakpoint/useIsEqualOrLargerThanBreakpoint";
import { tw } from "../../tailwind";

export type RawInputProps = IInputProps & {};

// as we need custom fontSize and lineHeight settings for centering Text on iOS we need to set it here via tw
export const createInputStyles = () => {
  const isEqualOrLargerThanXS = useIsEqualOrLargerThanBreakpoint("xs");
  return StyleSheet.create({
    input: tw`${isEqualOrLargerThanXS ? "text-xs" : "text-input"}`,
  });
};

export const RawInput = forwardRef((props: RawInputProps, ref) => {
  // only the necessary styles are defined here, the basic Input stylings are in App.tsx to override the
  // native-base stylings as the Input is also used internally in their Select component
  const styles = createInputStyles();

  return (
    <NbInput
      // @ts-ignore
      ref={ref}
      {...props}
      style={[styles.input, props.style]}
    />
  );
});
