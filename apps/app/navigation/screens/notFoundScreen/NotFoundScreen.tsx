import { useWindowDimensions } from "react-native";

import { CenterContent, Heading, Link, tw } from "@serenity-tools/ui";
import { RootStackScreenProps } from "../../../types/navigationProps";

export default function NotFoundScreen({}: RootStackScreenProps<"NotFound">) {
  useWindowDimensions(); // needed to ensure tw-breakpoints are triggered when resizing

  return (
    <CenterContent>
      <Heading lvl={1} style={tw`mb-4`}>
        This screen doesn't exist :{"("}
      </Heading>
      <Link to={{ screen: "Root" }}>Go to home</Link>
    </CenterContent>
  );
}
