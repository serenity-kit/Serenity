import React, { useEffect } from "react";
import { Platform, StyleSheet, useWindowDimensions } from "react-native";
import {
  ModalProps as ReactNativeModalProps,
  ReactNativeModal,
} from "react-native-modal";
import { tw } from "../../tailwind";
import { Box } from "../box/Box";

type ModalProps = Pick<
  ReactNativeModalProps,
  "isVisible" | "onBackdropPress" | "style" | "children"
> & {
  onModalHide?: () => void;
};

export const Modal = React.forwardRef(
  (
    { children, isVisible, onBackdropPress, onModalHide, ...rest }: ModalProps,
    ref: any
  ) => {
    const dimensions = useWindowDimensions();
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
        onModalHide={onModalHide}
        onBackdropPress={onBackdropPress}
        isVisible={isVisible}
        animationIn="fadeIn"
        animationOut="fadeOut"
        animationInTiming={150}
        animationOutTiming={150}
        backdropOpacity={0.5}
        useNativeDriverForBackdrop
        avoidKeyboard // makes sure the modal animates up when the virtual keyboard is open
        style={[styles.modal, rest.style]}
      >
        <Box
          style={[
            styles.box,
            {
              maxWidth: dimensions.width - 16, // making sure it doesn't go off screen on mobile
            },
          ]}
        >
          {children}
        </Box>
      </ReactNativeModal>
    );
  }
);
