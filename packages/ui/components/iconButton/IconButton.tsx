import { useFocusRing } from "@react-native-aria/focus";
import { HStack } from "native-base";
import React, { forwardRef } from "react";
import { Platform, StyleSheet } from "react-native";
import { tw } from "../../tailwind";
import { Color } from "../../types";
import { Icon, IconNames } from "../icon/Icon";
import { Pressable, PressableProps } from "../pressable/Pressable";
import { Spinner } from "../spinner/Spinner";
import { Text } from "../text/Text";

export type IconButtonProps = PressableProps & {
  name: IconNames;
  color?: Color;
  label?: string;
  size?: "md" | "lg" | "xl";
  transparent?: boolean;
  isLoading?: boolean;
  isActive?: boolean;
};

export const IconButton = forwardRef((props: IconButtonProps, ref) => {
  const { isFocusVisible, focusProps: focusRingProps } = useFocusRing();
  const {
    name,
    size = "md",
    color,
    transparent,
    label,
    isLoading,
    isActive,
    ...rest
  } = props;

  // the pressable style sizing defines the clickable area
  const pressableSize = {
    md: "h-5 w-5",
    lg: "h-8 w-8",
    xl: "h-12 w-12",
  };

  // the dimensions of the button define the visible area when clicked or hovered
  let dimensions = size === "md" ? "w-5 h-5" : "w-8 h-8";
  let iconColor = color ?? "gray-400";

  if (label) {
    dimensions = "w-auto h-auto";
    iconColor = color ?? "gray-600";
  }

  if (props.disabled) {
    iconColor = "gray-500";
  }

  // --- dev only
  // const showClickableArea = false;

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
      } items-center bg-transparent rounded-md ${
        label ? `pl-1.5 pr-3 py-1 rounded` : ""
      }`
    ),
    hover: transparent ? tw`bg-${iconColor}/15` : tw`bg-gray-200`,
    pressed: transparent ? tw`bg-${iconColor}/25` : tw`bg-gray-300`,
    focusVisible: Platform.OS === "web" ? tw`se-inset-focus-mini` : {},
    active: transparent
      ? tw`border border-${iconColor}/20 bg-${iconColor}/10`
      : tw`border border-gray-200 bg-gray-150`,
  });

  return (
    <Pressable
      ref={ref}
      {...rest}
      accessibilityRole={props.accessibilityRole ?? "button"}
      // @ts-expect-error - web only
      onFocus={focusRingProps.onFocus}
      // @ts-expect-error - web only
      onBlur={focusRingProps.onBlur}
      // disable default outline styles
      // @ts-expect-error - web only
      _focusVisible={{ _web: { style: { outlineStyle: "none" } } }}
      // @ts-expect-error - native base style mismatch
      style={[styles.pressable, rest.style]}
    >
      {({ isPressed, isHovered, isFocused }) => {
        return (
          <HStack
            style={[
              styles.stack,
              isHovered && !isLoading && styles.hover,
              isActive && styles.active,
              isPressed && !isLoading && styles.pressed,
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
                name={name}
                color={
                  (isHovered || isActive) && !transparent
                    ? "gray-800"
                    : iconColor
                }
              />
            )}

            {label && (
              <Text
                variant="xs"
                style={
                  (isHovered || isActive) && !transparent
                    ? tw`text-gray-800`
                    : tw`text-${iconColor}`
                }
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
