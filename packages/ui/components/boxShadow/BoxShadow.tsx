import React, { forwardRef } from "react";
import { StyleSheet } from "react-native";
import { View, ViewProps } from "../view/View";
import { tw } from "../../tailwind";

export type BoxShadowLevels = 0 | 1 | 2 | 3;

export type BoxShadowProps = ViewProps & {
  elevation: BoxShadowLevels;
  rounded?: boolean;
};

export const BoxShadow = forwardRef((props: BoxShadowProps, ref) => {
  const { elevation, rounded } = props;

  const shadows = [
    {
      outer: tw``,
      inner: tw``,
    },
    {
      outer: tw`shadow-black shadow-opacity-10 shadow-radius-0.25 shadow-offset-0/0.25`,
      inner: tw`shadow-black shadow-opacity-15 shadow-radius-0.5 shadow-offset-0/0.25`,
    },
    {
      outer: tw`shadow-black shadow-opacity-10 shadow-radius-0.5 shadow-offset-0/0.5`,
      inner: tw`shadow-black shadow-opacity-15 shadow-radius-2 shadow-offset-0/0.5`,
    },
    {
      outer: tw`shadow-black shadow-opacity-10 shadow-radius-1 shadow-offset-0/1`,
      inner: tw`shadow-black shadow-opacity-10 shadow-radius-2.5 shadow-offset-0/1`,
    },
  ];

  const styles = StyleSheet.create({
    outer: shadows[elevation].outer,
    inner: shadows[elevation].inner,
  });

  return (
    <View
      {...props}
      style={[styles.outer, props.style, rounded && tw`rounded`]}
    >
      <View style={[styles.inner, rounded && tw`rounded`]}>
        {props.children}
      </View>
    </View>
  );
});
