import { HStack } from "native-base";
import React from "react";
import { StyleSheet } from "react-native";
import { tw } from "../../tailwind";
import { View, ViewProps } from "../view/View";
import { Text } from "../text/Text";
import { useIsDesktopDevice } from "../../hooks/useIsDesktopDevice/useIsDesktopDevice";

export type ListProps = ViewProps & {
  data: Object;
  empty: React.ReactNode;
  headerData?: Array<string>;
  mainWidth?: string;
  mainWidthMobile?: string;
};

export const List = (props: ListProps) => {
  const {
    data,
    empty,
    headerData,
    mainWidth = "1/2",
    mainWidthMobile = "1/2",
    ...rest
  } = props;
  const isDesktopDevice = useIsDesktopDevice();

  const styles = StyleSheet.create({
    mainColumn: isDesktopDevice ? tw`w-${mainWidth}` : tw`w-${mainWidthMobile}`,
    list: tw`rounded border border-gray-200 overflow-hidden`,
    headerRow: tw`p-2 bg-gray-100`,
  });

  return (
    <View {...rest} style={styles.list}>
      {headerData && isDesktopDevice ? (
        <HStack style={styles.headerRow}>
          {headerData.map((item, i) => {
            return (
              <View style={i === 0 && styles.mainColumn} key={"header_" + i}>
                <Text variant="xxs" style={tw`uppercase`} bold>
                  {item}
                </Text>
              </View>
            );
          })}
        </HStack>
      ) : null}
      {data ? props.children : empty}
    </View>
  );
};
