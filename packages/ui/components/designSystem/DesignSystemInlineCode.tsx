import React from "react";
import { StyleSheet } from "react-native";
import { tw } from "../../tailwind";
import { Mono, MonoProps } from "../mono/Mono";

export type DesignSystemInlineCodeProps = MonoProps & {};

export const DesignSystemInlineCode = (props: DesignSystemInlineCodeProps) => {
  const styles = StyleSheet.create({
    mono: tw`px-1.25 bg-primary-100 text-primary-400 rounded self-start`,
  });

  return <Mono style={[styles.mono, props.style]}>{props.children}</Mono>;
};
