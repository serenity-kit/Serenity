import React, { forwardRef } from "react";
import { StyleSheet } from "react-native";
import { Box as NbBox, IBoxProps, VStack } from "native-base";
import { tw } from "../../tailwind";

export type BoxProps = IBoxProps & {
  plush?: boolean;
};

export const Box = forwardRef((props: BoxProps, ref) => {
  const styles = StyleSheet.create({
    // max-width set as we use boxes mainly as dialogs yet and they should be uniform in the whole application
    box: tw`max-w-md w-full bg-white text-base text-gray-900 rounded-xl`,
    plush: tw`px-6 py-12 sm:px-12`,
    nonPlush: tw`p-6`,
  });

  return (
    <NbBox
      {...props}
      ref={ref}
      style={[
        styles.box,
        props.plush ? styles.plush : styles.nonPlush,
        props.style,
      ]}
    >
      <VStack space="4">{props.children}</VStack>
    </NbBox>
  );
});
