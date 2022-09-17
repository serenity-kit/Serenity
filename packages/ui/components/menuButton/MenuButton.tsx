import { HStack } from "native-base";
import React from "react";
import { StyleSheet } from "react-native";
import { tw } from "../../tailwind";
import { Icon, IconNames } from "../icon/Icon";
import { Pressable, PressableProps } from "../pressable/Pressable";
import { Text } from "../text/Text";
import { View } from "../view/View";

export type MenuButtonProps = PressableProps & {
  icon?: IconNames;
  danger?: boolean;
  shortcut?: React.ReactNode;
};

export const MenuButton = React.forwardRef(
  (
    { px = 3, py = 2, danger, icon, shortcut, ...rest }: MenuButtonProps,
    ref: any
  ) => {
    const iconColor = danger ? "error-500" : "gray-800";
    const styles = StyleSheet.create({
      text: danger ? tw`text-error-500` : tw`text-gray-800`,
      hover: danger ? tw`bg-error-100` : tw`bg-gray-200`,
      disabled: tw`bg-transparent opacity-50`, // TODO opacity tbd
    });

    return (
      <Pressable
        ref={ref}
        {...rest}
        px={px}
        py={py}
        // @ts-expect-error - native base style mismatch
        style={[rest.style]}
        _hover={{
          style: styles.hover,
        }}
        _disabled={{
          style: styles.disabled,
        }}
        _focusVisible={{
          // disable default outline styles
          _web: { style: [{ outlineStyle: "none" }, tw`se-inset-focus-mini`] },
        }}
      >
        <HStack space={2} alignItems="center" style={tw`flex`}>
          {icon && <Icon name={icon} color={iconColor} />}
          <Text variant="xs" style={styles.text}>
            {rest.children}
          </Text>
          {shortcut && <View style={tw`ml-auto`}>{shortcut}</View>}
        </HStack>
      </Pressable>
    );
  }
);
