import React from "react";
import { StyleSheet, Text as RNText } from "react-native";
import { tw } from "../../tailwind";

export type DescriptionProps = RNText["props"] & {
  variant: "login" | "modal" | "form";
};

export const Description = (props: DescriptionProps) => {
  const { variant } = props;

  const styles = StyleSheet.create({
    // 1rem (16px)
    login: tw.style(
      `text-base text-gray-700 md:text-gray-600 dark:text-white`,
      {
        fontFamily: "Inter_400Regular",
      }
    ),
    // 0.8125rem (13px)
    modal: tw.style(`text-xs text-gray-800 dark:text-white`, {
      fontFamily: "Inter_400Regular",
    }),
    // 0.8125rem (13px) light
    form: tw.style(`text-xs text-gray-700 dark:text-white`, {
      fontFamily: "Inter_400Regular",
    }),
  });

  return (
    <RNText {...props} style={[styles[variant], props.style]}>
      {props.children}
    </RNText>
  );
};
