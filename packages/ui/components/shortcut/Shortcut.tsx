import React, { forwardRef } from "react";
import { StyleSheet } from "react-native";
import { HStack, IStackProps } from "native-base";
import { Text } from "../text/Text";
import { Icon, IconNames } from "../icon/Icon";
import { tw } from "../../tailwind";

export type ShortcutProps = IStackProps & {
  iconNames?: IconNames[];
  letter: string;
};

export const Shortcut = forwardRef((props: ShortcutProps, ref) => {
  const { iconNames } = props;
  const styles = StyleSheet.create({
    stack: tw``,
  });

  const names = iconNames ?? ["command-line"];

  return (
    <HStack {...props} alignItems="center" style={[styles.stack, props.style]}>
      {names.map((icon) => {
        return (
          <Icon
            name={icon}
            size={3}
            mobileSize={4}
            color={"gray-400"}
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
