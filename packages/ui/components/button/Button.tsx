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

interface Props extends PressableProps {}
type ComputeStyleParams = {
  disabled?: boolean | null;
  isPressed: boolean;
  isHovered: boolean;
  isFocusVisible: boolean;
  isFocused: boolean;
};

const computeStyle = ({
  disabled,
  isPressed,
  isHovered,
  isFocusVisible,
}: ComputeStyleParams) => {
  if (disabled) return tw`bg-gray-300`;

  let style: any = isFocusVisible
    ? tw.style("se-outline-focus") // web only
    : {};
  if (isPressed) return tw.style(`bg-primary-600`);
  // style is merged in to make sure a focused button that is hovered still has an outline
  if (isHovered) return tw.style(`bg-primary-700`, style);
  return style;
};

export const Button = forwardRef((props: Props, ref) => {
  const { isFocusVisible, focusProps: focusRingProps } = useFocusRing();
  const styles = StyleSheet.create({
    wrapper: tw`rounded px-4 py-3 bg-primary-500`,
    text: tw`text-base text-center text-gray-100`,
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
              }),
              { cursor: props.disabled ? "not-allowed" : "pointer" }, // web only
              props.style,
            ]}
          >
            <RnText style={styles.text}>{props.children}</RnText>
          </RnView>
        );
      }}
    </Pressable>
  );
});
