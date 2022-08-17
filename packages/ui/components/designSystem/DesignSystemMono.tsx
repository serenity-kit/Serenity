import React from "react";
import { StyleSheet } from "react-native";
import { tw } from "../../tailwind";
import { Mono, MonoProps } from "../mono/Mono";

export type DesignSystemMonoVariants =
  | "base"
  | "code"
  | "component"
  | "property"
  | "type";

export type DesignSystemMonoProps = MonoProps & {
  variant?: DesignSystemMonoVariants;
};

export const DesignSystemMono = (props: DesignSystemMonoProps) => {
  const { variant = "base", ...rest } = props;

  const styles = StyleSheet.create({
    base: tw`text-base`,
    code: tw`text-gray-400`,
    component: tw`text-primary-500`,
    property: tw`px-1.25 pt-0.25 pb-0.5 bg-primary-100 text-primary-400 rounded self-start`,
    type: tw`text-primary-500`,
  });

  return (
    <Mono
      {...rest}
      style={[styles[variant], props.style]}
      size={variant === "component" ? "medium" : "small"}
    >
      {props.children}
    </Mono>
  );
};
