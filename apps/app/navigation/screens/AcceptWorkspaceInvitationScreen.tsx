import React, { useState } from "react";
import { Text, View } from "@serenity-tools/ui";
import { useEffect } from "react";
import { useWindowDimensions, StyleSheet } from "react-native";
import { useClient } from "urql";
import { useAuthentication } from "../../context/AuthenticationContext";
import { useAcceptWorkspaceInvitationMutation } from "../../generated/graphql";
import { RootStackScreenProps } from "../../types";

export default function AcceptWorkspaceInvitationScreen(
  props: RootStackScreenProps<"AcceptInvitation">
) {
  const workspaceInvitationId = props.route.path?.split("/")[2] || ""; // should never be undefined
  useWindowDimensions(); // needed to ensure tw-breakpoints are triggered when resizing
  const urqlClient = useClient();
  const { deviceSigningPublicKey } = useAuthentication();
  const [, acceptWorkspaceInvitationMutation] =
    useAcceptWorkspaceInvitationMutation();
  const [hasGraphqlError, setHasGraphqlError] = useState<boolean>(false);
  const [graphqlError, setGraphqlError] = useState<string>("");

  const isUserSignedIn = () => {
    return deviceSigningPublicKey !== null;
  };

  const acceptWorkspaceInvitation = async () => {
    const result = await acceptWorkspaceInvitationMutation({
      input: { workspaceInvitationId },
    });
    if (result.error) {
      setHasGraphqlError(true);
      setGraphqlError(result.error.message);
      return;
    }
    if (result.data) {
      // TODO: put up a toast explaining the new workspace
      const workspace = result.data.acceptWorkspaceInvitation?.workspace;
      if (!workspace) {
        // NOTE: probably the invitation expired or was deleted
        setHasGraphqlError(true);
        setGraphqlError("Could not find workspace");
        return;
      }
      props.navigation.navigate("Workspace", {
        workspaceId: workspace.id,
        screen: "Editor",
      });
    }
  };

  useEffect(() => {
    if (isUserSignedIn()) {
      acceptWorkspaceInvitation();
    } else {
      props.navigation.replace("Root");
    }
  }, [deviceSigningPublicKey, urqlClient, props.navigation]);

  return (
    <>
      {hasGraphqlError && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorText}>{graphqlError}</Text>
        </View>
      )}
      <View>
        <Text>Splash Screen (show loading indicator after 200ms)</Text>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  errorBanner: {
    backgroundColor: "red",
  },
  errorText: {
    color: "white",
  },
});
