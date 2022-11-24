import { useFocusEffect } from "@react-navigation/native";
import { CenterContent, Spinner } from "@serenity-tools/ui";
import { useMachine } from "@xstate/react";
import { useWindowDimensions } from "react-native";
import { RootStackScreenProps } from "../../../types/navigationProps";
import { rootScreenMachine } from "./rootScreenMachine";

export default function RootScreen(props: RootStackScreenProps<"Root">) {
  useWindowDimensions(); // needed to ensure tw-breakpoints are triggered when resizing
  const [, send] = useMachine(rootScreenMachine, {
    context: {
      navigation: props.navigation,
    },
  });

  // react-navigation in certain situations does not unmount screens and therefor we need to trigger
  // a fresh start of the machine when the screen is focused again
  useFocusEffect(() => {
    send("start");
  });

  return (
    <CenterContent>
      <Spinner fadeIn size="lg" />
    </CenterContent>
  );
}
