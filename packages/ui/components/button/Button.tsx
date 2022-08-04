// inspired by https://github.com/GeekyAnts/NativeBase/blob/master/src/components/primitives/Button/Button.tsx

import React, { forwardRef } from "react";
import { View as RnView, PressableProps, StyleSheet } from "react-native";
import { useFocusRing } from "@react-native-aria/focus";
import { Pressable } from "native-base";
import { tw } from "../../tailwind";
import { Text, TextVariants } from "../text/Text";
import { Spinner } from "../spinner/Spinner";
import { View } from "../view/View";

export type ButtonVariants = "primary" | "secondary";
export type ButtonSizes = "small" | "medium" | "large";

export type ButtonProps = PressableProps & {
  size?: ButtonSizes;
  variant?: ButtonVariants;
  isLoading?: boolean;
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

const textSizes: TextVariants[] = ["xxs", "small", "medium"];

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
        return tw`bg-gray-200 border-gray-200`;
      case "primary":
        return tw`bg-primary-100 border-primary-100`;
    }
  }

  let style: any = isFocusVisible
    ? tw.style(
        size === "large"
          ? "border-3 border-primary-700"
          : "border-2 border-primary-700"
      ) // web only
    : {};

  if (isPressed) {
    switch (variant) {
      case "secondary":
        return tw`bg-gray-300 border-gray-300`;
      case "primary":
        return tw`bg-primary-700 border-primary-700`;
    }
  }

  // style is merged in to make sure a focused button that is hovered still has an outline
  if (isHovered) {
    switch (variant) {
      case "secondary":
        return tw.style(`bg-gray-200 border-gray-200`, style);
      case "primary":
        return tw.style(`bg-primary-600 border-primary-600`, style);
    }
  }

  return style;
};

export const Button = forwardRef((props: ButtonProps, ref) => {
  const [spinnerSize, setSpinnerSize] = React.useState<null | {
    scale: number;
  }>(null);
  const { isFocusVisible, focusProps: focusRingProps } = useFocusRing();
  const {
    variant = "primary",
    size = "medium",
    isLoading = false,
    ...rest
  } = props;
  const disabled = props.disabled || isLoading;

  // generic wrapper-styles
  const wrapperStyle = {
    size: {
      // no py as we v-align the text via flex
      small: tw`h-8 px-4`,
      medium: tw`h-10 px-4`,
      large: tw`form-element-height px-6`,
    },
    variant: {
      primary: tw`bg-primary-500 border-primary-500`,
      secondary: tw`bg-transparent border-gray-200`,
    },
  };

  // generic text-styles
  const textStyle = {
    size: {
      small: textSizes[0],
      medium: textSizes[1],
      large: textSizes[2],
    },
    variant: {
      primary: disabled ? tw`text-primary-300` : tw`text-gray-100`,
      secondary: disabled ? tw`text-gray-400` : tw`text-gray-800`,
    },
  };

  const styles = StyleSheet.create({
    wrapper: tw.style(
      `flex justify-center border border-solid rounded`,
      wrapperStyle.size[size],
      wrapperStyle.variant[variant]
    ),
    text: tw`text-center font-button leading-5`, // leading needed for centering text next to Spinner
  });

  return (
    <Pressable
      ref={ref}
      disabled={disabled}
      {...rest}
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
                disabled,
                isPressed,
                isHovered,
                isFocusVisible,
                isFocused,
                variant,
                size,
              }),
              { cursor: disabled ? "not-allowed" : "pointer" }, // web only
              props.style,
            ]}
          >
            <View style={tw`flex flex-row justify-center`}>
              <View style={tw`grow items-end`}>
                {isLoading && spinnerSize ? (
                  // needed fixed width wrapper so scale calculation doesn't collide with flex
                  // for readability: 20 => spinner default size, 4 => tw sizing base
                  <View style={tw`w-${(spinnerSize.scale * 20) / 4}`}>
                    <Spinner
                      color={
                        variant === "secondary"
                          ? tw.color("gray-600")
                          : undefined
                      }
                      fadeIn
                      style={[
                        tw`mr-${spinnerSize.scale * 8}`,
                        {
                          transform: [
                            {
                              scale: spinnerSize.scale,
                            },
                          ],
                        },
                      ]}
                    />
                  </View>
                ) : null}
              </View>
              <Text
                onLayout={(event) => {
                  if (size === "small") {
                    setSpinnerSize({
                      scale: 0.5,
                    });
                  } else if (size === "medium") {
                    setSpinnerSize({
                      scale: 0.75,
                    });
                  } else {
                    setSpinnerSize({
                      scale: 0.9,
                    });
                  }
                }}
                variant={textStyle.size[size]}
                style={[styles.text, textStyle.variant[variant]]}
              >
                {props.children}
              </Text>
              <View style={tw`grow`} />
            </View>
          </RnView>
        );
      }}
    </Pressable>
  );
});
