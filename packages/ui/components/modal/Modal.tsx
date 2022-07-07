import React, { useEffect, useCallback } from "react";
import {
  ReactNativeModal,
  ModalProps as ReactNativeModalProps,
} from "react-native-modal";
import { StyleSheet, Platform } from "react-native";
import { Box } from "../box/Box";
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

  const closeModalOnEscape = useCallback((event) => {
    if (Platform.OS === "web" && event.keyCode === 27) {
      rest.onBackdropPress();
    }
  }, []);

  useEffect(() => {
    document.addEventListener("keydown", closeModalOnEscape);
    return () => {
      document.removeEventListener("keydown", closeModalOnEscape);
    };
  }, [closeModalOnEscape]);

  return (
    <ReactNativeModal
      ref={ref}
      {...rest}
      isVisible={isVisible}
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
