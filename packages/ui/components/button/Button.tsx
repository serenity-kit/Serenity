// inspired by https://github.com/GeekyAnts/NativeBase/blob/master/src/components/primitives/Button/Button.tsx

import React, { forwardRef } from "react";
import {
  Text as RnText,
  View as RnView,
  PressableProps,
  StyleSheet,
} from "react-native";
import { useFocusRing } from "@react-native-aria/focus";
import { Pressable } from "native-base";
import { tw } from "../../tailwind";

export type ButtonVariants = "primary" | "secondary";
export type ButtonSizes = "small" | "regular";

export type ButtonProps = PressableProps & {
  size?: ButtonSizes;
  variant?: ButtonVariants;
};

type ComputeStyleParams = {
  disabled?: boolean | null;
  isPressed: boolean;
  isHovered: boolean;
  isFocusVisible: boolean;
  isFocused: boolean;
  variant?: ButtonVariants | null;
  size?: ButtonSizes | null;
};

const computeStyle = ({
  disabled,
  isPressed,
  isHovered,
  isFocusVisible,
  variant,
  size,
}: ComputeStyleParams) => {
  if (disabled) {
    switch (variant) {
      case "secondary":
        return tw`bg-gray-100 border-gray-300`;
      case "primary":
      default:
        return tw`bg-gray-300 border-gray-300`;
    }
  }

  let style: any = isFocusVisible
    ? tw.style(size === "small" ? "se-inset-focus-mini" : "se-inset-focus") // web only
    : {};

  if (isPressed) {
    switch (variant) {
      case "secondary":
        return tw`bg-primary-200 border-primary-200`;
      case "primary":
      default:
        return tw`bg-primary-700 border-primary-700`;
    }
  }

  // style is merged in to make sure a focused button that is hovered still has an outline
  if (isHovered) {
    switch (variant) {
      case "secondary":
        return tw.style(`bg-primary-100`, style);
      case "primary":
      default:
        return tw.style(`bg-primary-600 border-primary-600`, style);
    }
  }

  return style;
};

export const Button = forwardRef((props: ButtonProps, ref) => {
  const { isFocusVisible, focusProps: focusRingProps } = useFocusRing();
  const { variant = "primary", size = "regular" } = props;

  // generic wrapper-styles
  const wrapperStyle = {
    size: {
      small: tw`px-3 py-2`,
      regular: tw`px-4 py-3`,
    },
    variant: {
      primary: tw`bg-primary-500 border-primary-500`,
      secondary: tw`bg-transparent border-primary-200`,
    },
  };

  // generic text-styles
  const textStyle = {
    size: {
      small: tw`small font-semibold`,
      regular: tw`text-base`,
    },
    variant: {
      primary: tw`text-gray-100`,
      secondary: tw`text-primary-400`,
    },
  };

  const styles = StyleSheet.create({
    wrapper: tw.style(
      `rounded border-solid border-2`,
      wrapperStyle.size[size],
      wrapperStyle.variant[variant]
    ),
    text: tw`text-center`,
  });

  return (
    <Pressable
      ref={ref}
      {...props}
      accessibilityRole={props.accessibilityRole ?? "button"}
      // @ts-expect-error - web only
      onFocus={focusRingProps.onFocus}
      // @ts-expect-error - web only
      onBlur={focusRingProps.onBlur}
      // disable default outline styles
      // @ts-expect-error - web only
      _focusVisible={{ _web: { style: { outlineWidth: 0 } } }}
    >
      {({ isPressed, isHovered, isFocused }) => {
        return (
          <RnView
            style={[
              styles.wrapper,
              computeStyle({
                disabled: props.disabled,
                isPressed,
                isHovered,
                isFocusVisible,
                isFocused,
                variant: props.variant,
                size: props.size,
              }),
              { cursor: props.disabled ? "not-allowed" : "pointer" }, // web only
              props.style,
            ]}
          >
            <RnText
              style={[
                styles.text,
                textStyle.size[size],
                textStyle.variant[variant],
                props.disabled && variant === "secondary" && tw`text-gray-400`,
              ]}
            >
              {props.children}
            </RnText>
          </RnView>
        );
      }}
    </Pressable>
  );
});
