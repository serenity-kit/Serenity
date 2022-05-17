import React from "react";
import {
  ReactNativeModal,
  ModalProps as ReactNativeModalProps,
} from "react-native-modal";

type ModalProps = Pick<
  ReactNativeModalProps,
  "isVisible" | "onBackdropPress" | "style" | "children"
>;

export const Modal = React.forwardRef(({ ...rest }: ModalProps, ref: any) => {
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
      style={rest.style}
    >
      {rest.children}
    </ReactNativeModal>
  );
});
