import React, { forwardRef } from "react";
import { StyleSheet } from "react-native";
import { HStack, VStack, IStackProps } from "native-base";
import { tw } from "../../tailwind";
import { BoxShadow } from "../boxShadow/BoxShadow";

export type BubbleMenuContentWrapperProps = IStackProps & {
  vertical?: boolean;
  padded?: boolean;
};

export const BubbleMenuContentWrapper = forwardRef(
  (props: BubbleMenuContentWrapperProps, ref) => {
    const { vertical = false, padded = true } = props;

    const styles = StyleSheet.create({
      stack: tw`bg-white border border-gray-200 rounded`,
      hstack: tw`h-8 px-1`,
      vstack: tw``,
    });

    return (
      <BoxShadow elevation={3} rounded ref={ref}>
        {vertical ? (
          <VStack {...props} style={[styles.stack, styles.vstack, props.style]}>
            {props.children}
          </VStack>
        ) : (
          <HStack
            {...props}
            space={1}
            style={[styles.stack, padded && styles.hstack, props.style]}
            alignItems="center"
          >
            {props.children}
          </HStack>
        )}
      </BoxShadow>
    );
  }
);
