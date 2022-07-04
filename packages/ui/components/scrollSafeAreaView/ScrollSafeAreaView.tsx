import React from "react";
import { ScrollView, ScrollViewProps } from "../scrollView/ScrollView";
import { SafeAreaView, Edge } from "react-native-safe-area-context";
import {
  SafeAreaBottomSpacer,
  tw,
} from "../SaafeAreaBottomSpacer/SafeAreaBottomSpacer";

export type ScrollSafeAreaViewProps = ScrollViewProps & {
  customHeader?: boolean;
};

export const ScrollSafeAreaView = React.forwardRef(
  (props: ScrollSafeAreaViewProps, ref) => {
    const { children, customHeader } = props;

    const edges: Edge[] = customHeader
      ? ["top", "right", "bottom", "left"]
      : ["right", "bottom", "left"];

    return (
      <ScrollView ref={ref} {...props}>
        <SafeAreaView style={tw`flex-auto`} edges={edges}>
          {children}
          <SafeAreaBottomSpacer />
        </SafeAreaView>
      </ScrollView>
    );
  }
);
