import { useFocusEffect } from "@react-navigation/native";
import { Heading } from "@serenity-tools/ui";
import { useMachine } from "@xstate/react";
import { useState } from "react";
import { RootStackScreenProps } from "../../../types/navigationProps";
import { sharePageSrcreenMachine } from "./sharePageSrcreenMachine";

export default function SharePageScreen(
  props: RootStackScreenProps<"SharePage">
) {
  const [key] = useState(window.location.hash.split("=")[1]);

  const [state, send] = useMachine(sharePageSrcreenMachine, {
    context: {
      virtualDeviceKey: key,
      documentId: props.route.params.documentId,
      token: props.route.params.token,
    },
  });

  useFocusEffect(() => {
    send("start");
  });

  if (state.value !== "done" && state.value !== "decryptDeviceFail") {
    return <Heading lvl={1}>loading...</Heading>;
  } else if (state.value === "decryptDeviceFail") {
    return <Heading lvl={1}>decryption failed</Heading>;
  } else {
    return <Heading lvl={1}>done</Heading>;
  }

  // return <Heading lvl={1}>To be implemented</Heading>;
}
