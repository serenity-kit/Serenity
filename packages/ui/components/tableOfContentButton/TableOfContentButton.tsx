import React, { useState } from "react";
import { StyleSheet, Platform } from "react-native";
import { useFocusRing } from "@react-native-aria/focus";
import { Pressable, PressableProps, tw, Text } from "@serenity-tools/ui";

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
      focusVisible: Platform.OS === "web" ? tw`se-inset-focus-mini` : tw``,
    });

    const pressableStyles = [
      tw`py-1 px-4`,
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
          style={[tw`pl-${(lvl - 1) * 3 || 0}`, styles.text]}
          bold={lvl === 1}
        >
          {rest.children}
        </Text>
      </Pressable>
    );
  }
);
