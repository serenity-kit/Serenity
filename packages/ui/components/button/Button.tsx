import React from "react";
import { Button as NativeBaseButton } from "native-base";
import { tw } from "../../tailwind";

const baseStyle = tw`rounded px-4 py-4`;

export function Button(props) {
  return (
    <NativeBaseButton
      {...props}
      style={tw.style(baseStyle, `bg-primary-500`, props.style)}
      _text={{
        style: tw`text-base text-center text-gray-100`,
      }}
      _hover={{
        style: tw.style(baseStyle, `bg-primary-400`, props.hoverStyle),
      }}
      _pressed={{
        style: tw.style(baseStyle, `bg-primary-600`, props.pressedStyle),
      }}
      _focus={{
        style: tw.style(baseStyle, `bg-primary-500`, props.focusStyle),
      }}
      _focusVisible={{
        style: tw.style(baseStyle, `bg-primary-500`, props.focusVisibleStyle),
      }}
      _disabled={{
        style: tw.style(baseStyle, `bg-gray-500`, props.disabledStyle),
      }}
    />
  );
}
