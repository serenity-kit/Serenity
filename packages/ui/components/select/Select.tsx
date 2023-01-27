import React from "react";
import { StyleSheet } from "react-native";
import { Select as NbSelect, ISelectProps } from "native-base";

export type SelectProps = ISelectProps & {};

export const Select = React.forwardRef((props: SelectProps, ref) => {
  const styles = StyleSheet.create({});

  return <NbSelect>{props.children}</NbSelect>;
});
