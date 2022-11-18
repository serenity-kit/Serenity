import { useFocusEffect } from "@react-navigation/native";
import sodium, { KeyPair } from "@serenity-tools/libsodium";
import { CenterContent, InfoMessage, Spinner } from "@serenity-tools/ui";
import { useMachine } from "@xstate/react";
import { useMemo, useState } from "react";
import { RootStackScreenProps } from "../../../types/navigationProps";
import { sharePageScreenMachine } from "./sharePageScreenMachine";

export default function SharePageScreen(
  props: RootStackScreenProps<"SharePage">
) {
  const [key] = useState(window.location.hash.split("=")[1]);

  const [state, send] = useMachine(sharePageScreenMachine, {
    context: {
      virtualDeviceKey: key,
      documentId: props.route.params.documentId,
      token: props.route.params.token,
    },
  });

  useFocusEffect(() => {
    send("start");
  });

  const signatureKeyPair: KeyPair | null = useMemo(() => {
    if (state.context.device) {
      return {
        publicKey: sodium.from_base64(state.context.device.signingPublicKey),
        privateKey: sodium.from_base64(state.context.device.signingPrivateKey!),
        keyType: "ed25519",
      };
    }
    return null;
  }, [state.context.device]);

  if (state.value !== "done" && state.value !== "decryptDeviceFail") {
    return (
      <CenterContent>
        <Spinner fadeIn />
      </CenterContent>
    );
  } else if (state.value === "decryptDeviceFail") {
    return (
      <CenterContent>
        <InfoMessage variant="error">
          Failed decrypting document access. Please ask for a new share link.
        </InfoMessage>
      </CenterContent>
    );
  } else if (signatureKeyPair) {
    return (
      <CenterContent>
        <InfoMessage>Show Page</InfoMessage>
      </CenterContent>
      // <Page
      //   navigation={props.navigation}
      //   route={props.route}
      //   // to force unmount and mount the page
      //   key={state.context.documentId}
      //   updateTitle={() => {}}
      //   signatureKeyPair={signatureKeyPair}
      //   workspaceId={"TODO"}
      // />
    );
  }
}
