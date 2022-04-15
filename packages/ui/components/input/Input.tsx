import React, { forwardRef } from "react";
import { Input as NbInput, IInputProps } from "native-base";
import { tw } from "../../tailwind";

const wrapperBaseStyle = tw`rounded`;
const inputBaseStyle = tw`text-base text-gray-900 px-4 py-3`;

export const Input = forwardRef((props: IInputProps, ref) => {
  return (
    <NbInput
      // @ts-ignore
      ref={ref}
      {...props}
      style={tw.style(inputBaseStyle)}
      _stack={{
        style: props.disabled
          ? tw.style(wrapperBaseStyle, `bg-gray-100 border-gray-400`)
          : tw.style(wrapperBaseStyle, `bg-white border-gray-400`),
      }}
      _hover={{
        _stack: {
          style: props.disabled
            ? tw.style(wrapperBaseStyle, `bg-gray-100 border-gray-400`)
            : tw.style(wrapperBaseStyle, `bg-white border-primary-500`),
        },
      }}
      _focus={{
        _stack: {
          style: tw.style(wrapperBaseStyle, `bg-white border-primary-500`),
        },
      }}
    />
  );
});
