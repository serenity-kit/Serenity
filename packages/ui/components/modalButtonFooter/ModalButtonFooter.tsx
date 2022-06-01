import { HStack } from "native-base";
import React, { forwardRef } from "react";

export type ModalButtonFooterProps = {
  cancel?: React.ReactNode;
  confirm: React.ReactNode;
};

export const ModalButtonFooter = forwardRef(
  (props: ModalButtonFooterProps, ref) => {
    return (
      <HStack justifyContent="flex-end" space={3}>
        {/* use defined props instead of just children to enforce the same buttonorder #usability */}
        {props.cancel}
        {props.confirm}
      </HStack>
    );
  }
);
