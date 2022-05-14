import React from "react";
import { StyleSheet } from "react-native";
import { tw } from "../../tailwind";
import { Modal as RnModal } from "react-native";

type ModalProps = RnModal["props"] & {};

export const Modal = React.forwardRef(({ ...rest }: ModalProps, ref: any) => {
  const styles = StyleSheet.create({
    default: tw`bg-white border-gray-800`,
  });

  return (
    <RnModal ref={ref} {...rest} style={rest.style}>
      {rest.children}
    </RnModal>
  );
});
