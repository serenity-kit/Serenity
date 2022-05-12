import React, { forwardRef } from "react";
import { StyleSheet } from "react-native";
import { Box as NbBox, IBoxProps, VStack } from "native-base";
import { tw } from "../../tailwind";

export const Box = forwardRef((props: IBoxProps, ref) => {
  const styles = StyleSheet.create({
    box: tw`bg-white text-base text-gray-900 px-6 py-12 sm:px-12 rounded-xl`,
  });

  return (
    <NbBox {...props} style={[styles.box, props.style]}>
      <VStack space="5">{props.children}</VStack>
    </NbBox>
  );
});
