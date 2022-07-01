import React, { forwardRef } from "react";
import { StyleSheet } from "react-native";
import { HStack, IStackProps } from "native-base";
import { Text } from "../text/Text";
import { Icon, IconNames } from "../icon/Icon";
import { tw } from "../../tailwind";

export type ShortcutProps = IStackProps & {
  icons?: IconNames[];
  letter: string;
};

export const Shortcut = forwardRef((props: ShortcutProps, ref) => {
  const { icons } = props;
  const styles = StyleSheet.create({
    stack: tw``,
  });

  const iconNames = icons ?? ["command-line"];

  return (
    <HStack {...props} alignItems="center" style={[styles.stack, props.style]}>
      {iconNames.map((icon) => {
        return (
          <Icon
            name={icon}
            size={3}
            mobileSize={4}
            color={tw.color("gray-400")}
            key={`icon_${icon}`}
          />
        );
      })}
      <Text variant="xs" style={tw`text-gray-400`} bold>
        {props.letter}
      </Text>
    </HStack>
  );
});
