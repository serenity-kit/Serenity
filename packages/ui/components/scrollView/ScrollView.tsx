import React from "react";
import { StyleSheet } from "react-native";
import { tw } from "../../tailwind";
import {
  ScrollView as RNScrollView,
  ScrollViewProps as RNScrollViewProps,
} from "react-native";

export type ScrollViewProps = RNScrollViewProps & {};

export const ScrollView = React.forwardRef(
  ({ children, ...rest }: ScrollViewProps, ref: any) => {
    const styles = StyleSheet.create({
      scrollView: tw`bg-white`,
    });

    return (
      <RNScrollView ref={ref} {...rest} style={[styles.scrollView, rest.style]}>
        {children}
      </RNScrollView>
    );
  }
);
