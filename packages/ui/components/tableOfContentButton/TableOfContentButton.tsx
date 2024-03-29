import { useFocusRing } from "@react-native-aria/focus";
import React, { useState } from "react";
import { Platform, StyleSheet } from "react-native";
import { tw } from "../../tailwind";
import { Pressable, PressableProps } from "../pressable/Pressable";
import { Text } from "../text/Text";

export type TableOfContentButtonProps = PressableProps & {
  active?: boolean;
  lvl: number;
};

export const TableOfContentButton = React.forwardRef(
  ({ active, lvl, ...rest }: TableOfContentButtonProps, ref: any) => {
    const [isHovered, setIsHovered] = useState(false);
    const { isFocusVisible, focusProps: focusRingProps } = useFocusRing();

    const styles = StyleSheet.create({
      text: active ? tw`text-primary-500` : tw``,
      hover: active ? tw`bg-primary-100` : tw`bg-gray-200`,
      active: tw`pr-3 border-r-3 border-primary-500/85`,
      focusVisible: Platform.OS === "web" ? tw`se-inset-focus-mini` : tw``,
    });

    const pressableStyles = [
      tw`py-1.5 px-4`,
      active && styles.active,
      isHovered && styles.hover,
      isFocusVisible && styles.focusVisible,
    ];

    return (
      <Pressable
        {...rest}
        {...focusRingProps} // sets onFocus and onBlur
        style={pressableStyles}
        _focusVisible={{
          // @ts-expect-error - web only
          _web: { style: [pressableStyles, { outlineStyle: "none" }] },
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <Text
          variant="xs"
          style={[tw`pl-${(lvl - 1) * 4 || 0}`, styles.text]}
          bold={lvl === 1}
        >
          {rest.children}
        </Text>
      </Pressable>
    );
  }
);
