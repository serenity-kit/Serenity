import React from "react";
import { StyleSheet } from "react-native";
import { HStack } from "native-base";
import { tw } from "../../tailwind";
import { Pressable, PressableProps } from "../pressable/Pressable";
import { Icon, IconNames } from "../icon/Icon";
import { View } from "../view/View";
import { Text } from "../text/Text";
import { useIsDesktopDevice } from "../../hooks/useIsDesktopDevice/useIsDesktopDevice";

export type MenuButtonProps = PressableProps & {
  iconName?: IconNames;
  danger?: boolean;
  shortcut?: React.ReactNode;
};

export const MenuButton = React.forwardRef(
  ({ danger, iconName, shortcut, ...rest }: MenuButtonProps, ref: any) => {
    const isDesktopDevice = useIsDesktopDevice();
    const iconColor = danger ? "error-500" : "gray-800";

    const styles = StyleSheet.create({
      text: danger ? tw`text-error-500` : tw`text-gray-800`,
      hover: danger ? tw`bg-error-100` : tw`bg-gray-200`,
      disabled: tw`bg-transparent opacity-50`, // TODO opacity tbd
      pressable: tw`py-3 md:py-2 px-5 md:px-3`,
    });

    return (
      <Pressable
        ref={ref}
        {...rest}
        // @ts-expect-error - native base style mismatch
        style={[styles.pressable, rest.style]}
        _hover={{
          style: [styles.hover, styles.pressable],
        }}
        _disabled={{
          style: [styles.disabled, styles.pressable],
        }}
        _focusVisible={{
          // disable default outline styles
          _web: { style: [{ outlineWidth: 0 }, tw`se-inset-focus-mini`] },
        }}
      >
        <HStack
          space={isDesktopDevice ? 2 : 4}
          alignItems="center"
          style={tw`flex`}
        >
          {iconName && <Icon name={iconName} color={iconColor} />}
          <Text variant={isDesktopDevice ? "xs" : "md"} style={styles.text}>
            {rest.children}
          </Text>
          {isDesktopDevice && shortcut ? (
            <View style={tw`ml-auto`}>{shortcut}</View>
          ) : null}
        </HStack>
      </Pressable>
    );
  }
);
