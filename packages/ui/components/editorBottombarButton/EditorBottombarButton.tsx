import React, { forwardRef } from "react";
import { tw } from "../../tailwind";
import { ToggleButton, ToggleButtonProps } from "../toggleButton/ToggleButton";

export type EditorBottombarButtonProps = ToggleButtonProps & {};

export const EditorBottombarButton = forwardRef(
  (props: EditorBottombarButtonProps, ref) => {
    return <ToggleButton {...props} style={tw`h-7 w-8.5`} />;
  }
);
