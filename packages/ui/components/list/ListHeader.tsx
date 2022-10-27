import React from "react";
import { HStack, IStackProps } from "native-base";
import { StyleSheet } from "react-native";
import { tw } from "../../tailwind";
import { View } from "../view/View";
import { Text } from "../text/Text";
import { useIsDesktopDevice } from "../../hooks/useIsDesktopDevice/useIsDesktopDevice";

export type ListHeaderProps = IStackProps & {
  data: Array<string>;
  mainIsIconText?: boolean;
  mainWidth?: string;
  mainWidthMobile?: string;
};

export const ListHeader = (props: ListHeaderProps) => {
  const {
    data,
    mainIsIconText = false,
    mainWidth = "1/2",
    mainWidthMobile = "1/2",
    ...rest
  } = props;
  const isDesktopDevice = useIsDesktopDevice();

  const styles = StyleSheet.create({
    headerRow: tw`p-2 justify-between bg-gray-100`,
    mainColumn: isDesktopDevice ? tw`w-${mainWidth}` : tw`w-${mainWidthMobile}`,
    subsetHeader: tw`w-2/5`, // same as for ListIconText elements
  });

  // if main (first) column is a ListIconText component,
  // the first 2 header elements need to be split and rendered separately in a wrapper
  const headers = mainIsIconText ? data.slice(2) : data;
  const mainSubset = data.slice(0, 2);

  return (
    <HStack {...rest} style={styles.headerRow}>
      {mainIsIconText ? (
        <HStack
          style={[styles.mainColumn, tw`justify-between`]}
          alignItems={"center"}
        >
          {mainSubset.map((item, i) => {
            return (
              <View
                key={"header_subset_" + i}
                style={[styles.subsetHeader, i > 0 && tw`text-center`]}
              >
                <Text variant="xxs" style={tw`uppercase`} bold>
                  {item}
                </Text>
              </View>
            );
          })}
        </HStack>
      ) : null}
      {headers.map((item, i) => {
        return (
          <View
            style={!mainIsIconText && i === 0 && styles.mainColumn}
            key={"header_" + i}
          >
            <Text variant="xxs" style={tw`uppercase`} bold>
              {item}
            </Text>
          </View>
        );
      })}
      {/* dummy: the same width as the action column to ensure the right header positioning */}
      <View style={tw`w-5`}>
        <Text variant="xxs" style={tw`uppercase`} bold></Text>
      </View>
    </HStack>
  );
};
