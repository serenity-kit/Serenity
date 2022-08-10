import { VStack, IStackProps } from "native-base";
import React, { forwardRef } from "react";

export type FormWrapperProps = IStackProps & {};

export const FormWrapper = forwardRef((props: FormWrapperProps, ref) => {
  return <VStack space={4}>{props.children}</VStack>;
});
