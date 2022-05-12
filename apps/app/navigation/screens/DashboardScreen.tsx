import { Text, View } from "@serenity-tools/ui";
import { useWindowDimensions } from "react-native";
import DevDashboardScreen from "./DevDashboardScreen";

export default function DashboardScreen(props) {
  useWindowDimensions(); // needed to ensure tw-breakpoints are triggered when resizing

  return (
    <View>
      <DevDashboardScreen {...props} />
    </View>
  );
}
