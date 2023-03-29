import { useFocusRing } from "@react-native-aria/focus";
import { HStack } from "native-base";
import React, { forwardRef } from "react";
import { Platform, StyleSheet } from "react-native";
import { tw } from "../../tailwind";
import { Icon, IconNames } from "../icon/Icon";
import { Pressable, PressableProps } from "../pressable/Pressable";

export type ToggleButtonProps = PressableProps & {
  name: IconNames;
  size?: "md" | "lg";
  isActive?: boolean;
  subtle?: boolean;
};

export const ToggleButton = forwardRef((props: ToggleButtonProps, ref) => {
  const { isFocusVisible, focusProps: focusRingProps } = useFocusRing();
  const { name, isActive, size = "md", disabled, subtle, ...rest } = props;

  const dimensions = size === "md" ? "h-6 w-6" : "h-8 w-8";
  const opacity = subtle ? "60" : "100";

  const styles = StyleSheet.create({
    pressable: tw`${dimensions}`,
    hstack: tw`h-full w-full items-center justify-center bg-transparent rounded`,
    active: tw`bg-primary-100/${opacity}`,
    hover: isActive
      ? tw`bg-primary-200/${opacity}`
      : tw`bg-gray-200/${opacity}`,
    pressed: tw`bg-primary-200/${opacity}`,
    focusVisible: Platform.OS === "web" ? tw`se-inset-focus-mini` : {},
    disabled: tw`bg-transparent opacity-50`, // TODO opacity tbd
    subtle: isActive ? tw`border border-primary-100` : tw``,
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
      _focusVisible={{
        _web: {
          // @ts-expect-error - web only
          style: [styles.pressable, rest.style, { outlineStyle: "none" }],
        },
      }}
      // @ts-expect-error - native base style mismatch
      style={[styles.pressable, rest.style]}
      accessibilityPressed={isActive}
    >
      {({ isPressed, isHovered, isFocused }) => {
        return (
          <HStack
            style={[
              styles.hstack,
              isActive && styles.active,
              subtle && styles.subtle,
              isHovered && styles.hover,
              isPressed && styles.pressed,
              isFocusVisible && styles.focusVisible,
              disabled && styles.disabled,
              { cursor: disabled ? "not-allowed" : "pointer" }, // web only
            ]}
          >
            <Icon
              name={name}
              color={isActive || isPressed ? "primary-500" : "gray-800"}
            />
          </HStack>
        );
      }}
    </Pressable>
  );
});
