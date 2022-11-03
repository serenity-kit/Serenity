import { HStack } from "native-base";
import React from "react";
import { StyleSheet } from "react-native";
import { tw } from "../../tailwind";
import { View, ViewProps } from "../view/View";
import { Text } from "../text/Text";
import { useIsDesktopDevice } from "../../hooks/useIsDesktopDevice/useIsDesktopDevice";

export type ListProps = ViewProps & {
  data: Array<any>;
  emptyString: string;
  header?: React.ReactNode;
  mainWidth?: string;
  mainWidthMobile?: string;
};

export const List = (props: ListProps) => {
  const {
    data,
    emptyString,
    mainWidth = "1/2",
    mainWidthMobile = "1/2",
    ...rest
  } = props;
  const isDesktopDevice = useIsDesktopDevice();
  const isEmpty = data.length < 1;

  const styles = StyleSheet.create({
    mainColumn: isDesktopDevice ? tw`w-${mainWidth}` : tw`w-${mainWidthMobile}`,
    list: tw.style(
      (isDesktopDevice || isEmpty) &&
        `rounded border border-gray-200 overflow-hidden`,
      isEmpty && `py-2 px-4 bg-gray-100`
    ),
    headerRow: tw`p-2 justify-between bg-gray-100`,
  });

  return (
    <View {...rest} style={styles.list}>
      {props.header && !isEmpty && isDesktopDevice ? props.header : null}
      {isEmpty ? (
        <Text variant="xs" style={tw`text-gray-500`}>
          {emptyString}
        </Text>
      ) : (
        props.children
      )}
    </View>
  );
};
