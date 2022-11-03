import { HStack, VStack } from "native-base";
import React from "react";
import { useIsDesktopDevice } from "../../hooks/useIsDesktopDevice/useIsDesktopDevice";
import { tw } from "../../tailwind";
import { Heading } from "../heading/Heading";
import { ScrollView } from "../scrollView/ScrollView";
import { View, ViewProps } from "../view/View";

export type SettingsContentWrapperProps = ViewProps & {
  title?: string;
  scrollViewTestID?: string;
};

export function SettingsContentWrapper(props: SettingsContentWrapperProps) {
  const { title } = props;
  const isDesktopDevice = useIsDesktopDevice();

  return (
    // set height needed for scroll-calculation
    <View style={tw`h-full`}>
      {isDesktopDevice ? (
        <HStack
          alignItems={"center"}
          style={tw`h-16 px-10 border-b border-gray-200`}
        >
          <Heading lvl={2}>{title}</Heading>
        </HStack>
      ) : null}
      <ScrollView
        style={tw`py-8 px-6 md:px-10`}
        testID={props.scrollViewTestID}
      >
        <VStack space={5}>{props.children}</VStack>
      </ScrollView>
    </View>
  );
}
