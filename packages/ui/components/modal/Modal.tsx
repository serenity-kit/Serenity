import React from "react";
import {
  ReactNativeModal,
  ModalProps as ReactNativeModalProps,
} from "react-native-modal";
import { StyleSheet } from "react-native";
import { Box } from "../box/Box";
import { Text } from "../text/Text";
import { tw } from "../../tailwind";

type ModalProps = Pick<
  ReactNativeModalProps,
  "isVisible" | "onBackdropPress" | "style" | "children"
>;

export const Modal = React.forwardRef(({ ...rest }: ModalProps, ref: any) => {
  const styles = StyleSheet.create({
    modal: tw`items-center`, // needed to horizontally center the box
    box: tw`p-6`,
  });

  return (
    <ReactNativeModal
      ref={ref}
      {...rest}
      animationIn="fadeIn"
      animationOut="fadeOut"
      animationInTiming={150}
      animationOutTiming={150}
      backdropOpacity={0.5}
      useNativeDriverForBackdrop
      style={[rest.style, styles.modal]}
    >
      <Box style={styles.box}>{rest.children}</Box>
    </ReactNativeModal>
  );
});
