import { CenterContent, Text } from "@serenity-tools/ui";
import { useWindowDimensions } from "react-native";
import { RootStackScreenProps } from "../../../types/navigation";

export default function LogoutInProgress({}: RootStackScreenProps<"LogoutInProgress">) {
  useWindowDimensions(); // needed to ensure tw-breakpoints are triggered when resizing

  return (
    <CenterContent>
      <Text>Logging out …</Text>
    </CenterContent>
  );
}
