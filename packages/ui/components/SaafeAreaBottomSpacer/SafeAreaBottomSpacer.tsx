import React from "react";
import { View } from "../view/View";
import { tw } from "../../tailwind";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export const SafeAreaBottomSpacer = () => {
  const insets = useSafeAreaInsets();

  return <View style={{ height: insets.bottom }} />;
};
