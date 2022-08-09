import {
  Box,
  Button,
  InfoMessage,
  LinkButton,
  Text,
  tw,
  View,
} from "@serenity-tools/ui";
import { useEffect, useState } from "react";
import { StyleSheet, useWindowDimensions } from "react-native";
import { useClient } from "urql";
import { LoginForm } from "../../components/login/LoginForm";
import RegisterForm from "../../components/register/RegisterForm";
import { useAuthentication } from "../../context/AuthenticationContext";
import {
  useAcceptWorkspaceInvitationMutation,
  WorkspaceInvitation,
  WorkspaceInvitationDocument,
  WorkspaceInvitationQuery,
  WorkspaceInvitationQueryVariables,
} from "../../generated/graphql";
import { RootStackScreenProps } from "../../types/navigation";
import { acceptWorkspaceInvitation } from "../../utils/workspace/acceptWorkspaceInvitation";

export default function AcceptWorkspaceInvitationScreen(
  props: RootStackScreenProps<"AcceptWorkspaceInvitation">
) {
  const workspaceInvitationId = props.route.params?.workspaceInvitationId;
  useWindowDimensions(); // needed to ensure tw-breakpoints are triggered when resizing
  const { sessionKey } = useAuthentication();
  const urqlClient = useClient();
  const [workspaceInvitation, setWorkspaceInvitation] = useState<
    WorkspaceInvitation | undefined
  >();
  const [workspaceInvitationError, setWorkspaceInvitationError] =
    useState(false);
  const [noWorkspaceInvitationFoundError, setNoWorkspaceInvitationFoundError] =
    useState(false);
  const [, acceptWorkspaceInvitationMutation] =
    useAcceptWorkspaceInvitationMutation();
  const [hasGraphqlError, setHasGraphqlError] = useState<boolean>(false);
  const [graphqlError, setGraphqlError] = useState<string>("");
  const [authForm, setAuthForm] = useState<"login" | "register">("login");

  const getWorskpaceInvitation = async (workspaceInvitationId: string) => {
    const workspaceInvitationResult = await urqlClient
      .query<WorkspaceInvitationQuery, WorkspaceInvitationQueryVariables>(
        WorkspaceInvitationDocument,
        { id: workspaceInvitationId },
        {
          // better to be safe here and always refetch
          requestPolicy: "network-only",
        }
      )
      .toPromise();
    if (workspaceInvitationResult.error) {
      setWorkspaceInvitationError(true);
    } else if (!workspaceInvitationResult.data?.workspaceInvitation) {
      setNoWorkspaceInvitationFoundError(true);
    } else {
      setWorkspaceInvitation(
        workspaceInvitationResult.data.workspaceInvitation
      );
    }
  };

  useEffect(() => {
    if (workspaceInvitationId) {
      getWorskpaceInvitation(workspaceInvitationId);
    }
  }, []);

  if (!workspaceInvitationId) {
    return (
      <InfoMessage variant="error" icon>
        Unfortunately your link misses an invitation ID. Please check verify the
        invitation link is correct.
      </InfoMessage>
    );
  }
  const acceptAndGoToWorkspace = async () => {
    try {
      const workspace = await acceptWorkspaceInvitation({
        workspaceInvitationId,
        acceptWorkspaceInvitationMutation,
      });
      props.navigation.navigate("Workspace", {
        workspaceId: workspace!.id,
        screen: "WorkspaceRoot",
      });
    } catch (error) {
      setHasGraphqlError(true);
      setGraphqlError(error.message);
    }
  };

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

  const onLoginSuccess = async () => {
    await acceptAndGoToWorkspace();
  };

  const onAcceptWorkspaceInvitationPress = async () => {
    await acceptAndGoToWorkspace();
  };

  return (
    <>
      {workspaceInvitationError && (
        <InfoMessage variant="error" icon>
          Unfortunately there was an error retrieving your invitation. Please
          try again later or contact support.
        </InfoMessage>
      )}
      {noWorkspaceInvitationFoundError && (
        <InfoMessage variant="error" icon>
          Unfortunately the invitation doesn't exist or was deleted. Please
          contact the person that invited you to send you a new invitation link.
        </InfoMessage>
      )}
      {!workspaceInvitationError && !noWorkspaceInvitationFoundError && (
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
              {workspaceInvitation && (
                <View style={styles.alertBanner}>
                  <Text style={styles.alertBannerText}>
                    You have been invited to join workspace{" "}
                    <b>{workspaceInvitation?.workspaceName}</b> by{" "}
                    <b>{workspaceInvitation?.inviterUsername}</b>
                  </Text>
                  {!sessionKey && (
                    <Text style={styles.alertBannerText}>
                      Log in or register to accept the invitation.
                    </Text>
                  )}
                </View>
              )}
              {sessionKey ? (
                <Button onPress={onAcceptWorkspaceInvitationPress} size="large">
                  Accept
                </Button>
              ) : (
                <>
                  {authForm === "login" ? (
                    <>
                      <LoginForm onLoginSuccess={onLoginSuccess} />
                      <View style={tw`text-center`}>
                        <Text variant="xs" muted>
                          Don't have an account?
                        </Text>
                        <LinkButton onPress={switchToRegisterForm}>
                          Register here
                        </LinkButton>
                      </View>
                    </>
                  ) : (
                    <>
                      <RegisterForm
                        pendingWorkspaceInvitationId={
                          props.route.params.workspaceInvitationId
                        }
                        onRegisterSuccess={onRegisterSuccess}
                      />
                      <View style={tw`text-center`}>
                        <Text variant="xs" muted>
                          Already have an account?
                        </Text>
                        <LinkButton onPress={switchToLoginForm}>
                          Login here
                        </LinkButton>
                      </View>
                    </>
                  )}
                </>
              )}
            </Box>
          </View>
        </>
      )}
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
