import { CenterContent, Spinner } from "@serenity-tools/ui";
import { useMachine } from "@xstate/react";
import { useWindowDimensions } from "react-native";
import { RootStackScreenProps } from "../../../types/navigation";
import { rootScreenMachine } from "./rootScreenMachine";

export default function RootScreen(props: RootStackScreenProps<"Root">) {
  useWindowDimensions(); // needed to ensure tw-breakpoints are triggered when resizing
  const [state] = useMachine(rootScreenMachine, {
    context: {
      navigation: props.navigation,
    },
  });

  console.log("RootScreen", state.value);

  return (
    <CenterContent>
      <Spinner fadeIn size="lg" />
    </CenterContent>
  );
}
