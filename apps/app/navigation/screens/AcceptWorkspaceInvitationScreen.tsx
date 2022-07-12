import React, { useState } from "react";
import { Text, View, tw, Box, Button } from "@serenity-tools/ui";
import { useWindowDimensions, StyleSheet } from "react-native";
import { useAuthentication } from "../../context/AuthenticationContext";
import {
  useAcceptWorkspaceInvitationMutation,
  useWorkspaceInvitationQuery,
} from "../../generated/graphql";
import { RootStackScreenProps } from "../../types/navigation";
import { LoginForm } from "../../components/login/LoginForm";
import RegisterForm from "../../components/register/RegisterForm";

export default function AcceptWorkspaceInvitationScreen(
  props: RootStackScreenProps<"AcceptWorkspaceInvitation">
) {
  const workspaceInvitationId = props.route.params?.workspaceInvitationId;
  useWindowDimensions(); // needed to ensure tw-breakpoints are triggered when resizing
  const { sessionKey } = useAuthentication();
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
  const [authForm, setAuthForm] = useState<"login" | "register">("login");

  if (!workspaceInvitationId) {
    return (
      <View>
        <Text>Invalid invitation.</Text>
      </View>
    );
  }

  const switchToRegisterForm = () => {
    setAuthForm("register");
  };

  const switchToLoginForm = () => {
    setAuthForm("login");
  };

  const onRegisterSuccess = (username: string, verificationCode: string) => {
    props.navigation.navigate("RegistrationVerification", {
      username,
      verification: verificationCode,
    });
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
        screen: "WorkspaceRoot",
      });
    }
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
              {!sessionKey && (
                <Text style={styles.alertBannerText}>
                  Log in or register to accept the invitation.
                </Text>
              )}
            </View>
          )}
          {sessionKey ? (
            <Button onPress={acceptWorkspaceInvitation} size="large">
              Accept
            </Button>
          ) : (
            <>
              {authForm === "login" ? (
                <LoginForm onRegisterPress={switchToRegisterForm} />
              ) : (
                <RegisterForm
                  pendingWorkspaceInvitationId={
                    props.route.params.workspaceInvitationId
                  }
                  onLoginPress={switchToLoginForm}
                  onRegisterSuccess={onRegisterSuccess}
                />
              )}
            </>
          )}
        </Box>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  alertBanner: {},
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
