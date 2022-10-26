import React from "react";
import { HStack, IStackProps } from "native-base";
import { StyleSheet } from "react-native";
import { tw } from "../../tailwind";
import { View } from "../view/View";
import { Text } from "../text/Text";
import { useIsDesktopDevice } from "../../hooks/useIsDesktopDevice/useIsDesktopDevice";

export type ListHeaderProps = IStackProps & {
  data: Array<string>;
  mainIsSplit?: boolean;
  splitWidth?: string;
  mainWidth?: string;
  mainWidthMobile?: string;
};

export const ListHeader = (props: ListHeaderProps) => {
  const {
    data,
    mainIsSplit,
    splitWidth = "1/4",
    mainWidth = "1/2",
    mainWidthMobile = "1/2",
    ...rest
  } = props;
  const isDesktopDevice = useIsDesktopDevice();

  const styles = StyleSheet.create({
    mainColumn: isDesktopDevice ? tw`w-${mainWidth}` : tw`w-${mainWidthMobile}`,
    headerRow: tw`p-2 justify-between bg-gray-100`,
  });

  return (
    <HStack {...rest} style={styles.headerRow}>
      {data.map((item, i) => {
        let headerStyle = mainIsSplit ? tw`${splitWidth}` : styles.mainColumn;

        if ((mainIsSplit && i <= 1) || (!mainIsSplit && i < 1)) {
          headerStyle = tw``;
        }

        return (
          <View style={headerStyle} key={"header_" + i}>
            <Text variant="xxs" style={tw`uppercase`} bold>
              {item}
            </Text>
          </View>
        );
      })}
    </HStack>
  );
};
