import {
  Box,
  Button,
  InfoMessage,
  Link,
  LinkButton,
  Spinner,
  Text,
  tw,
  View,
} from "@serenity-tools/ui";
import { VStack } from "native-base";
import { useState } from "react";
import { useWindowDimensions } from "react-native";
import { LoginForm } from "../../../components/login/LoginForm";
import { OnboardingScreenWrapper } from "../../../components/onboardingScreenWrapper/OnboardingScreenWrapper";
import RegisterForm from "../../../components/register/RegisterForm";
import {
  useAcceptWorkspaceInvitationMutation,
  useWorkspaceInvitationQuery,
} from "../../../generated/graphql";
import { RootStackScreenProps } from "../../../types/navigation";
import { acceptWorkspaceInvitation } from "../../../utils/workspace/acceptWorkspaceInvitation";

const Wrapper = ({ children }) => (
  <OnboardingScreenWrapper>
    <Box plush>{children}</Box>
  </OnboardingScreenWrapper>
);

const ErrorWrapper = ({ children }) => (
  <Wrapper>
    <VStack alignItems="center" space={4} style={tw`text-center`}>
      <Text variant={"lg"} bold>
        Hi there!
      </Text>
      {children}
    </VStack>
  </Wrapper>
);

export default function AcceptWorkspaceInvitationScreen(
  props: RootStackScreenProps<"AcceptWorkspaceInvitation">
) {
  const workspaceInvitationId = props.route.params?.workspaceInvitationId;
  useWindowDimensions(); // needed to ensure tw-breakpoints are triggered when resizing
  const [workspaceInvitationQueryResult] = useWorkspaceInvitationQuery({
    variables: {
      id: workspaceInvitationId,
    },
  });
  const [, acceptWorkspaceInvitationMutation] =
    useAcceptWorkspaceInvitationMutation();
  const [hasGraphqlError, setHasGraphqlError] = useState<boolean>(false);
  const [graphqlError, setGraphqlError] = useState<string>("");
  const [authForm, setAuthForm] = useState<"login" | "register">("login");

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

  if (workspaceInvitationQueryResult.fetching) {
    return (
      <Wrapper>
        <VStack alignItems="center" space={4} style={tw`text-center`}>
          <Spinner fadeIn style={tw`mt-4`} />
        </VStack>
      </Wrapper>
    );
  }

  if (workspaceInvitationQueryResult.error) {
    return (
      <ErrorWrapper>
        <InfoMessage variant="error" icon>
          Unfortunately there was an error retrieving your invitation. Please
          try again later or contact our support at hi@serenity.li.
        </InfoMessage>
      </ErrorWrapper>
    );
  }

  if (workspaceInvitationQueryResult.data?.workspaceInvitation === null) {
    return (
      <ErrorWrapper>
        <InfoMessage variant="error" icon>
          Unfortunately the invitation doesn't exist or was deleted. Please
          contact the person that invited you, to send you a new invitation
          link.
        </InfoMessage>
      </ErrorWrapper>
    );
  }

  if (
    workspaceInvitationQueryResult.data?.workspaceInvitation?.expiresAt &&
    new Date(
      workspaceInvitationQueryResult.data?.workspaceInvitation?.expiresAt
    ) <= new Date()
  ) {
    return (
      <ErrorWrapper>
        <InfoMessage variant="error" icon>
          Unfortunately the invitation already expired. Please contact the
          person that invited you, to send you a new invitation link.
        </InfoMessage>
      </ErrorWrapper>
    );
  }

  return (
    <Wrapper>
      <VStack alignItems="center" space={4} style={tw`text-center`}>
        <Text variant={"lg"} bold>
          Hi there!
        </Text>
        <Text>
          You have been invited to join workspace{" "}
          <Text bold>
            {
              workspaceInvitationQueryResult.data?.workspaceInvitation
                ?.workspaceName
            }
          </Text>{" "}
          by{" "}
          <Text bold>
            {
              workspaceInvitationQueryResult.data?.workspaceInvitation
                ?.inviterUsername
            }
          </Text>
        </Text>

        {workspaceInvitationQueryResult.data?.me?.id ? null : (
          <Text variant="sm" muted>
            Log in or register to accept the invitation.
          </Text>
        )}
        {hasGraphqlError ? (
          <InfoMessage variant="error" icon>
            Failed to accept the invitation. Please try again later or contact
            our support at hi@serenity.li.
          </InfoMessage>
        ) : null}
      </VStack>
      {workspaceInvitationQueryResult.data?.me?.id ? (
        <>
          <Button
            onPress={onAcceptWorkspaceInvitationPress}
            style={tw`self-center mt-2`}
          >
            Accept invitation
          </Button>
          <View style={tw`mt-2 text-center`}>
            <Link to={{ screen: "Root" }}>Ignore invitation</Link>
          </View>
        </>
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
                <LinkButton onPress={switchToLoginForm}>Login here</LinkButton>
              </View>
            </>
          )}
        </>
      )}
    </Wrapper>
  );
}
