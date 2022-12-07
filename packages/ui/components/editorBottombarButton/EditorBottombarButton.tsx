import { useFocusRing } from "@react-native-aria/focus";
import { HStack } from "native-base";
import React, { forwardRef } from "react";
import { Platform, StyleSheet } from "react-native";
import { tw } from "../../tailwind";
import { Icon, IconNames } from "../icon/Icon";
import { Pressable, PressableProps } from "../pressable/Pressable";

export type EditorBottombarButtonProps = PressableProps & {
  name: IconNames;
  isActive?: boolean;
};

export const EditorBottombarButton = forwardRef(
  (props: EditorBottombarButtonProps, ref) => {
    const { isFocusVisible, focusProps: focusRingProps } = useFocusRing();
    const { name, isActive, ...rest } = props;

    const styles = StyleSheet.create({
      pressable: tw``,
      hstack: tw`h-7 w-8.5 md:h-6 md:w-6 items-center justify-center bg-transparent rounded`,
      active: tw`bg-primary-100`,
      hover: isActive ? tw`bg-primary-200` : tw`bg-gray-200`,
      pressed: tw`bg-primary-200`,
      focusVisible: Platform.OS === "web" ? tw`se-inset-focus-mini` : {},
      disabled: tw`bg-transparent opacity-50`, // TODO opacity tbd
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
        style={(styles.pressable, props.style)}
      >
        {({ isPressed, isHovered, isFocused }) => {
          return (
            <HStack
              style={[
                styles.hstack,
                isActive && styles.active,
                isHovered && styles.hover,
                isPressed && styles.pressed,
                isFocusVisible && styles.focusVisible,
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
  }
);
