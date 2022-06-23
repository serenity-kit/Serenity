import { View } from "@serenity-tools/ui";
import { useWindowDimensions } from "react-native";

export default function NoPageExistsScreen(props) {
  useWindowDimensions(); // needed to ensure tw-breakpoints are triggered when resizing

  return <View></View>;
}
