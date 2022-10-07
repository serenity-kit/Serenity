import React, { useEffect } from "react";
import { Platform, StyleSheet } from "react-native";
import {
  ModalProps as ReactNativeModalProps,
  ReactNativeModal,
} from "react-native-modal";
import { tw } from "../../tailwind";
import { Box } from "../box/Box";

type ModalProps = Pick<
  ReactNativeModalProps,
  "isVisible" | "onBackdropPress" | "style" | "children" | "onDismiss"
>;

export const Modal = React.forwardRef(
  (
    { children, isVisible, onBackdropPress, onDismiss, ...rest }: ModalProps,
    ref: any
  ) => {
    const styles = StyleSheet.create({
      modal: tw`items-center`, // needed to horizontally center the box
      box: tw``,
    });

    useEffect(() => {
      let escapeKeyListener: any = null;
      if (Platform.OS === "web") {
        escapeKeyListener = (e: KeyboardEvent) => {
          if (e.key === "Escape" && isVisible) {
            onBackdropPress();
          }
        };
        document.addEventListener("keydown", escapeKeyListener);
      }
      return () => {
        if (Platform.OS === "web") {
          document.removeEventListener("keydown", escapeKeyListener);
        }
      };
    }, [isVisible, onBackdropPress]);

    return (
      <ReactNativeModal
        ref={ref}
        {...rest}
        onDismiss={onDismiss}
        onBackdropPress={onBackdropPress}
        isVisible={isVisible}
        animationIn="fadeIn"
        animationOut="fadeOut"
        animationInTiming={150}
        animationOutTiming={150}
        backdropOpacity={0.5}
        useNativeDriverForBackdrop
        style={[rest.style, styles.modal]}
      >
        <Box style={styles.box}>{children}</Box>
      </ReactNativeModal>
    );
  }
);
