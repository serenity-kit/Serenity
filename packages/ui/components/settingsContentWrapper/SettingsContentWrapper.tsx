import React from "react";
import { View, ViewProps } from "../view/View";
import { tw } from "../../tailwind";
import { ScrollView } from "../scrollView/ScrollView";
import { HStack, VStack } from "native-base";
import { Heading } from "../heading/Heading";
import { useIsDesktopDevice } from "../../hooks/useIsDesktopDevice/useIsDesktopDevice";

export type SettingsContentWrapperProps = ViewProps & {
  title?: string;
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
      <ScrollView style={tw`py-8 px-6 md:px-10`}>
        <VStack space={5}>{props.children}</VStack>
      </ScrollView>
    </View>
  );
}
