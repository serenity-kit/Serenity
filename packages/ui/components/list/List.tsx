import { HStack } from "native-base";
import React from "react";
import { StyleSheet } from "react-native";
import { tw } from "../../tailwind";
import { View, ViewProps } from "../view/View";
import { Text } from "../text/Text";

export type ListProps = ViewProps & {
  data: Object;
  empty: React.ReactNode;
  headerData?: Array<string>;
};

export const List = (props: ListProps) => {
  const { data, empty, headerData, ...rest } = props;

  const styles = StyleSheet.create({
    mainColumn: tw`w-1/2`,
    list: tw`rounded border border-gray-200 overflow-hidden`,
    headerRow: tw`p-2 bg-gray-100`,
  });

  return (
    <View {...rest} style={styles.list}>
      {headerData ? (
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
