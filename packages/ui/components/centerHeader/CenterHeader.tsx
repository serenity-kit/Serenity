import React from "react";
import { View as RNView, StyleSheet } from "react-native";
import { useIsPermanentLeftSidebar } from "../../hooks/useIsPermanentLeftSidebar";
import { tw } from "../../tailwind";
import { Button } from "../button/Button";
import { View } from "../view/View";
import { HStack } from "native-base";

export type CenterHeaderProps = RNView["props"] & {
  openDrawer: () => void;
};

const styles = StyleSheet.create({
  view: tw`bg-white dark:bg-gray-900 border-b border-gray-200`,
});

export const CenterHeader = React.forwardRef(
  (
    { openDrawer, children, ...rest }: CenterHeaderProps,
    ref: React.Ref<RNView> | undefined
  ) => {
    const isPermanentLeftSidebar = useIsPermanentLeftSidebar();

    return (
      <View ref={ref} {...rest} style={[styles.view, rest.style]}>
        <HStack alignItems="center" style={tw`h-top-bar`}>
          {isPermanentLeftSidebar ? null : (
            <Button onPress={openDrawer}>Open Menu</Button>
          )}
          {children}
        </HStack>
      </View>
    );
  }
);
