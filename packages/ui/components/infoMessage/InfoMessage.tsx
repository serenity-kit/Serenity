import React, { forwardRef } from "react";
import { StyleSheet } from "react-native";
import { tw } from "../../tailwind";
import { Text } from "../text/Text";
import { Icon, IconNames } from "../icon/Icon";
import { VStack, IStackProps } from "native-base";

export type InfoMessageProps = IStackProps & {
  variant?: "info" | "error";
  icon?: boolean;
};

export const InfoMessage = forwardRef((props: InfoMessageProps, ref) => {
  const { variant = "info", icon = false, ...rest } = props;

  const iconTypes: IconNames[] = ["information-line", "warning-fill"];
  const iconNames = {
    info: iconTypes[0],
    error: iconTypes[1],
  };

  const iconColors = {
    info: "primary-900",
    error: "error-500",
  };

  const styles = StyleSheet.create({
    stack: tw.style(
      `py-4 px-6 border rounded`,
      variant === "info"
        ? `bg-primary-100 border-primary-200`
        : `bg-error-100 border-error-200`
    ),
    text: variant === "info" ? tw`text-primary-900` : tw`text-error-500`,
  });

  return (
    <VStack
      {...rest}
      justifyContent="center"
      alignItems="center"
      space={2}
      style={[styles.stack, props.style]}
    >
      {icon ? (
        <Icon name={iconNames[variant]} color={iconColors[variant]} />
      ) : null}
      <Text
        style={[styles.text, icon ? tw`text-center` : tw`text-left`]}
        variant="xs"
      >
        {props.children}
      </Text>
    </VStack>
  );
});
