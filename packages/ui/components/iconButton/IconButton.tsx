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
  size?: "md" | "lg";
  transparent?: boolean;
  isLoading?: boolean;
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
    ...rest
  } = props;

  let dimensions = size === "lg" ? "w-8 h-8" : "w-5 h-5";
  let iconColor = color ?? "gray-400";

  if (label) {
    dimensions = "w-auto h-auto";
    iconColor = color ?? "gray-600";
  }

  if (props.disabled) {
    iconColor = "gray-500";
  }

  const styles = StyleSheet.create({
    pressable: tw.style(dimensions), // defines clickable area
    view: tw.style(
      `${dimensions} flex ${
        !label ? "justify-center" : ""
      } items-center bg-transparent rounded-md ${
        label ? `pl-1.5 pr-3 py-1 rounded` : ""
      }`
    ),
    hover: transparent ? tw`bg-${iconColor}/15` : tw`bg-gray-200`,
    pressed: transparent ? tw`bg-${iconColor}/25` : tw`bg-gray-300`,
    focusVisible: Platform.OS === "web" ? tw`se-inset-focus-mini` : {},
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
              styles.view,
              isHovered && !isLoading && styles.hover,
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
                color={isHovered && !transparent ? "gray-800" : iconColor}
              />
            )}

            {label && (
              <Text
                variant="xs"
                style={
                  isHovered && !transparent
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
