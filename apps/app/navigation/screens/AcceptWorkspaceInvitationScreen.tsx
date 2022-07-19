import React, { useState } from "react";
import { Text, View, tw, Box } from "@serenity-tools/ui";
import { useWindowDimensions, StyleSheet } from "react-native";
import {
  useAcceptWorkspaceInvitationMutation,
  useWorkspaceInvitationQuery,
} from "../../generated/graphql";
import { RootStackScreenProps } from "../../types/navigation";
import { LoginForm } from "../../components/login/LoginForm";
export default function AcceptWorkspaceInvitationScreen(
  props: RootStackScreenProps<"AcceptWorkspaceInvitation">
) {
  const workspaceInvitationId = props.route.params?.workspaceInvitationId;
  useWindowDimensions(); // needed to ensure tw-breakpoints are triggered when resizing
  const [workspaceInvitationQuery, refetchWorkspaceInvitationQuery] =
    useWorkspaceInvitationQuery({
      variables: {
        id: workspaceInvitationId,
      },
    });
  const [, acceptWorkspaceInvitationMutation] =
    useAcceptWorkspaceInvitationMutation();
  const [hasGraphqlError, setHasGraphqlError] = useState<boolean>(false);
  const [graphqlError, setGraphqlError] = useState<string>("");

  if (!workspaceInvitationId) {
    return (
      <View>
        <Text>Invalid invitation.</Text>
      </View>
    );
  }

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
        screen: "WorkspaceRoot",
      });
    }
  };

  const onLoginSuccess = () => {
    // TODO
  };

  return (
    <>
      {hasGraphqlError && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorText}>{graphqlError}</Text>
        </View>
      )}
      <View
        style={tw`bg-white xs:bg-primary-900 justify-center items-center flex-auto`}
      >
        <Box>
          {!workspaceInvitationQuery.fetching && (
            <View style={styles.alertBanner}>
              <Text style={styles.alertBannerText}>
                You have been invited to join workspace{" "}
                <b>
                  {
                    workspaceInvitationQuery.data?.workspaceInvitation
                      ?.workspaceName
                  }
                </b>{" "}
                by{" "}
                <b>
                  {
                    workspaceInvitationQuery.data?.workspaceInvitation
                      ?.inviterUsername
                  }
                </b>
              </Text>

              <Text style={styles.alertBannerText}>
                Log in to accept the invitation.
              </Text>
            </View>
          )}
          <LoginForm onLoginSuccess={onLoginSuccess} />
        </Box>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  alertBanner: {
    padding: 20,
    backgroundColor: "#fff",
    color: "#000",
    marginBottom: 30,
  },
  alertBannerText: {
    color: "#000",
  },
  errorBanner: {
    backgroundColor: "red",
  },
  errorText: {
    color: "white",
  },
});
