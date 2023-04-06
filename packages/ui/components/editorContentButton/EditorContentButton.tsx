import { useFocusRing } from "@react-native-aria/focus";
import { HStack } from "native-base";
import React, { useState } from "react";
import { Platform, StyleSheet } from "react-native";
import { tw } from "../../tailwind";
import { Icon, IconNames } from "../icon/Icon";
import { Pressable, PressableProps } from "../pressable/Pressable";
import { Text } from "../text/Text";

export type EditorContentButtonProps = PressableProps & {
  iconName?: IconNames;
};

export const EditorContentButton = React.forwardRef(
  ({ iconName, ...rest }: EditorContentButtonProps, ref: any) => {
    const [isHovered, setIsHovered] = useState(false);
    const { isFocusVisible, focusProps: focusRingProps } = useFocusRing();

    const styles = StyleSheet.create({
      text: tw`text-gray-700`,
      hover: tw`bg-gray-120`,
      focusVisible: Platform.OS === "web" ? tw`se-inset-focus-mini` : tw``,
    });

    const pressableStyles = [
      tw`py-1 px-2 rounded`,
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
        <HStack alignItems={"center"} space={1.5}>
          {iconName ? (
            <Icon name={iconName} size={3} color={"gray-600"} />
          ) : null}
          <Text variant="xs" style={[styles.text]}>
            {rest.children}
          </Text>
        </HStack>
      </Pressable>
    );
  }
);
