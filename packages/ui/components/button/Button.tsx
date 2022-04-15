// inspired by https://github.com/GeekyAnts/NativeBase/blob/master/src/components/primitives/Button/Button.tsx

import React, { forwardRef } from "react";
import { Text as RnText, View as RnView } from "react-native";
import { useFocusRing } from "@react-native-aria/focus";
import { Pressable } from "native-base";
import { tw } from "../../tailwind";

const baseStyle = tw`rounded px-4 py-4`;

const computeStyle = (
  disabled: boolean,
  isPressed: boolean,
  isHovered: boolean,
  isFocusVisible: boolean,
  isFocused: boolean
) => {
  if (disabled) return tw`bg-gray-400`;

  let style: any = isFocusVisible
    ? {
        boxShadow: `${tw.color("primary-900")} 0px 0px 0px 4px`,
      }
    : {};
  if (isPressed) return tw.style(`bg-primary-200`);
  if (isHovered) return tw.style(`bg-primary-300`, style);
  return style;
};

type Props = {
  children: React.ReactNode;
  disabled?: boolean;
};

export const Button = (props) => {
  const { isFocusVisible, focusProps: focusRingProps } = useFocusRing();

  return (
    <Pressable
      {...props}
      rounded
      accessibilityRole={props.accessibilityRole ?? "button"}
      // @ts-expect-error - web only
      onFocus={focusRingProps.onFocus}
      // @ts-expect-error - web only
      onBlur={focusRingProps.onBlur}
      // disable default outline styles
      _focusVisible={{ _web: { style: { outlineWidth: 0 } } }}
    >
      {({ isPressed, isHovered, isFocused }) => {
        return (
          <RnView
            style={tw.style(
              baseStyle,
              `bg-primary-500`,
              computeStyle(
                props.disabled,
                isPressed,
                isHovered,
                isFocusVisible,
                isFocused
              ),
              { cursor: props.disabled ? "not-allowed" : "pointer" }, // web only
              props.style
            )}
          >
            <RnText style={tw`text-base text-center text-gray-100`}>
              {props.children}
            </RnText>
          </RnView>
        );
      }}
    </Pressable>
  );
};
