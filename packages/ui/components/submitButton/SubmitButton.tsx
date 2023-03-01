import { useFocusRing } from "@react-native-aria/focus";
import { HStack } from "native-base";
import React, { forwardRef } from "react";
import { Platform, StyleSheet } from "react-native";
import { tw } from "../../tailwind";
import { Icon } from "../icon/Icon";
import { Pressable, PressableProps } from "../pressable/Pressable";
import { Spinner } from "../spinner/Spinner";
import { Text } from "../text/Text";

export type SubmitButtonProps = PressableProps & {
  // name: IconNames;
  label?: string;
  size?: "md" | "lg" | "xl";
  isLoading?: boolean;
};

export const SubmitButton = forwardRef((props: SubmitButtonProps, ref) => {
  const { isFocusVisible, focusProps: focusRingProps } = useFocusRing();
  const { size = "md", label, isLoading = false, ...rest } = props;

  const disabled = props.disabled || isLoading;

  // the pressable style sizing defines the clickable area
  const pressableSize = {
    md: "h-6 w-6",
    lg: "h-8 w-8",
    xl: "h-12 w-12",
  };

  // the dimensions of the button define the visible area when clicked or hovered
  let dimensions = size === "md" ? "w-6 h-6" : "w-8 h-8";

  if (label) {
    dimensions = "w-auto h-auto";
  }

  // --- dev only
  // const showClickableArea = true;

  const styles = StyleSheet.create({
    pressable: tw.style(
      label
        ? dimensions
        : tw`flex justify-center items-center ${pressableSize[size]}`
      // showClickableArea && tw`bg-collaboration-honey/40`
    ),
    stack: tw.style(
      `${dimensions} flex ${
        !label ? "justify-center" : ""
      } items-center rounded-full ${label ? `pl-1.5 pr-3 py-1 rounded` : ""}`
    ),
    default: disabled ? tw`bg-primary-100` : tw`bg-primary-500`,
    hover: tw`bg-primary-600`,
    pressed: tw`bg-primary-700`,
    focusVisible: Platform.OS === "web" ? tw`se-outline-focus-submit` : {},
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
      _focusVisible={{
        _web: {
          // @ts-expect-error - web only
          style: [styles.pressable, rest.style, { outlineStyle: "none" }],
        },
      }}
      _focus={{
        _web: {
          // @ts-expect-error - web only
          style: [styles.pressable, rest.style, { outlineStyle: "none" }],
        },
      }}
      // @ts-expect-error - native base style mismatch
      style={[styles.pressable, rest.style]}
    >
      {({ isPressed, isHovered, isFocused }) => {
        return (
          <HStack
            style={[
              styles.stack,
              styles.default,
              isHovered && !disabled && styles.hover,
              isPressed && !disabled && styles.pressed,
              isFocusVisible && styles.focusVisible,
            ]}
            space={2}
          >
            {isLoading ? (
              <Spinner
                fadeIn
                style={[
                  {
                    transform: [
                      {
                        scale: 0.7,
                      },
                    ],
                  },
                ]}
              />
            ) : (
              <Icon
                name={"arrow-up-line"}
                color={disabled ? "primary-300" : "gray-100"}
              />
            )}

            {label && (
              <Text
                variant="xs"
                style={disabled ? tw`text-primary-300` : tw`text-gray-100`}
              >
                {props.label}
              </Text>
            )}
          </HStack>
        );
      }}
    </Pressable>
  );
});
