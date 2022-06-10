import React, { forwardRef } from "react";
import { StyleSheet, Platform } from "react-native";
import { useFocusRing } from "@react-native-aria/focus";
import { tw } from "../../tailwind";
import { Pressable, PressableProps } from "../pressable/Pressable";
import { Icon, IconNames, View } from "@serenity-tools/ui";

export type IconButtonProps = PressableProps & {
  name: IconNames;
  color?: string;
  large?: boolean;
};

export const IconButton = forwardRef((props: IconButtonProps, ref) => {
  const { isFocusVisible, focusProps: focusRingProps } = useFocusRing();
  const { name, large, color = "gray-400", ...rest } = props;

  const dimensions = large ? "w-8 h-8" : "w-5 h-5";

  const styles = StyleSheet.create({
    pressable: tw.style(dimensions), // defines clickable area
    view: tw.style(
      `${dimensions} flex justify-center items-center bg-transparent rounded-sm`
    ),
    hover: tw`bg-gray-200`,
    pressed: tw`bg-gray-300`,
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
      _focusVisible={{ _web: { style: { outlineWidth: 0 } } }}
      style={styles.pressable}
    >
      {({ isPressed, isHovered, isFocused }) => {
        return (
          <View
            style={[
              styles.view,
              isHovered && styles.hover,
              isPressed && styles.pressed,
              isFocusVisible && styles.focusVisible,
            ]}
          >
            <Icon
              name={name}
              color={tw.color(isHovered ? "gray-800" : color)}
            />
          </View>
        );
      }}
    </Pressable>
  );
});
