import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetModalProps,
} from "@gorhom/bottom-sheet";
import React, { useCallback, useLayoutEffect, useRef } from "react";
import { StyleSheet, TouchableWithoutFeedback, View } from "react-native";
import { Popover } from "react-native-popper";
import { IPopoverProps } from "react-native-popper/lib/typescript/types";
import { useIsDesktopDevice } from "../../hooks/useIsDesktopDevice/useIsDesktopDevice";
import { tw } from "../../tailwind";
import { BoxShadow } from "../boxShadow/BoxShadow";

export type MenuProps = {
  isOpen: boolean;
  testID?: string;
  onChange: (isOpen: boolean) => void;
  trigger: React.ReactElement;
  popoverProps?: Omit<IPopoverProps, "children" | "trigger"> & View["props"];
  bottomSheetModalProps: Omit<BottomSheetModalProps, "children">;
  children: React.ReactNode;
};

export const Menu = ({
  children,
  isOpen,
  testID,
  onChange,
  bottomSheetModalProps,
  popoverProps,
  trigger,
}: MenuProps) => {
  const isDesktopDevice = useIsDesktopDevice();

  const styles = StyleSheet.create({
    // overflow setting needed so children with a set background don't spill
    menu: tw`py-1.5 bg-white rounded overflow-hidden`,
  });

  const bottomSheetRef = useRef<BottomSheetModal>(null);
  const handleSheetChanges = useCallback(
    (index: number) => {
      if (index === -1) {
        onChange(false);
      }
    },
    [onChange]
  );

  useLayoutEffect(() => {
    if (isOpen) {
      bottomSheetRef.current?.present();
    } else {
      bottomSheetRef.current?.dismiss();
    }
  }, [isOpen]);

  // see https://github.com/gorhom/react-native-bottom-sheet/issues/585 for more details
  const renderBackdrop = useCallback(
    (props) => (
      <BottomSheetBackdrop
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        opacity={0.25}
        {...props}
      />
    ),
    []
  );

  if (isDesktopDevice) {
    return (
      <Popover
        {...popoverProps}
        trigger={trigger}
        mode="multiple"
        isOpen={isOpen}
        onOpenChange={onChange}
      >
        <Popover.Backdrop />
        <Popover.Content>
          <TouchableWithoutFeedback
            testID={testID}
            onPress={() => {
              onChange(false);
            }}
          >
            <BoxShadow elevation={2} rounded>
              <View style={[styles.menu, popoverProps?.style]}>{children}</View>
            </BoxShadow>
          </TouchableWithoutFeedback>
        </Popover.Content>
      </Popover>
    );
  }

  const triggerElem = React.cloneElement(trigger, {
    onPress: () => {
      onChange(!isOpen);
    },
  });

  return (
    <>
      {triggerElem}
      <BottomSheetModal
        {...bottomSheetModalProps}
        ref={bottomSheetRef}
        index={0}
        onChange={handleSheetChanges}
        style={tw`shadow-black shadow-opacity-5 shadow-radius-2 shadow-offset-0/0`}
        backdropComponent={renderBackdrop}
      >
        {children}
      </BottomSheetModal>
    </>
  );
};
