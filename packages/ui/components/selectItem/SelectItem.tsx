import React from "react";
import { StyleSheet } from "react-native";
import { Select as NbSelect, ISelectItemProps } from "native-base";

export type SelectItemProps = ISelectItemProps & {};

export const SelectItem = React.forwardRef((props: SelectItemProps, ref) => {
  const styles = StyleSheet.create({});

  return <NbSelect.Item {...props} />;
});
