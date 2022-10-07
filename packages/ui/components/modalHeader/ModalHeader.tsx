import React, { forwardRef } from "react";
import { Text, TextProps } from "../text/Text";

export type ModalHeaderProps = TextProps & {};

export const ModalHeader = forwardRef((props: TextProps, ref) => {
  return <Text variant="lg">{props.children}</Text>;
});
