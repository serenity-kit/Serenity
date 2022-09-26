import { Spinner, Text, View } from "@serenity-tools/ui";
import { useMachine } from "@xstate/react";
import { StyleSheet, useWindowDimensions } from "react-native";
import { RootStackScreenProps } from "../../../types/navigation";
import { workspaceNotDecryptedScreenMachine } from "./workspaceNotDecryptedScreenMachine";

export default function WorkspaceNotDecryptedScreen({
  navigation,
  route,
}: RootStackScreenProps<"WorkspaceNotDecrypted">) {
  useWindowDimensions(); // needed to ensure tw-breakpoints are triggered when resizing

  const workspaceId = route.params?.workspaceId;
  // TODO show error message in case there is network error
  // TODO communicate when the next check attempt is happening
  const [state] = useMachine(workspaceNotDecryptedScreenMachine, {
    context: {
      workspaceId,
      navigation,
    },
  });

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        You joined the workspace. You now need to wait for any other workspace
        member to make the workspace content available to you.
      </Text>
      <View style={styles.activityIndicatorContainer}>
        <Spinner style={styles.activityIndicator} />
        <Text>Waiting for authorization</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  activityIndicatorContainer: {
    justifyContent: "center",
    flexDirection: "row",
    paddingVertical: 15,
  },
  activityIndicator: {
    marginRight: 15,
  },
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
  },
  link: {
    marginTop: 15,
    paddingVertical: 15,
  },
  linkText: {
    fontSize: 14,
    color: "#2e78b7",
  },
});
