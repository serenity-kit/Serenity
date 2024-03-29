import * as userChain from "@serenity-kit/user-chain";
import { notNull } from "@serenity-tools/common";
import {
  Box,
  Button,
  Description,
  Heading,
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
import { VerifyPasswordModal } from "../../../components/verifyPasswordModal/VerifyPasswordModal";
import { useAppContext } from "../../../context/AppContext";
import {
  runUserChainQuery,
  useWorkspaceInvitationQuery,
} from "../../../generated/graphql";
import { getMainDevice } from "../../../store/mainDeviceMemoryStore";
import { RootStackScreenProps } from "../../../types/navigationProps";
import { acceptWorkspaceInvitation } from "../../../utils/workspace/acceptWorkspaceInvitation";

const Wrapper = ({ children }) => (
  <OnboardingScreenWrapper>
    <Box plush>{children}</Box>
  </OnboardingScreenWrapper>
);

const ErrorWrapper = ({ children }) => (
  <Wrapper>
    <VStack alignItems="center" space={4} style={tw`text-center`}>
      <Heading lvl={1} padded>
        Hi there!
      </Heading>
      {children}
    </VStack>
  </Wrapper>
);

export default function AcceptWorkspaceInvitationScreen(
  props: RootStackScreenProps<"AcceptWorkspaceInvitation">
) {
  // TODO: display error if there is no key
  const [signingKeyPairSeed] = useState(window.location.hash.split("=")[1]);

  const workspaceInvitationId = props.route.params?.workspaceInvitationId;
  useWindowDimensions(); // needed to ensure tw-breakpoints are triggered when resizing
  const [workspaceInvitationQueryResult] = useWorkspaceInvitationQuery({
    variables: {
      id: workspaceInvitationId,
    },
  });
  const [hasGraphqlError, setHasGraphqlError] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [authForm, setAuthForm] = useState<"login" | "register">("login");
  const [isPasswordModalVisible, setIsPasswordModalVisible] = useState(false);

  const { activeDevice } = useAppContext();

  const acceptAndGoToWorkspace = async () => {
    const mainDevice = getMainDevice();
    if (!mainDevice) {
      setIsPasswordModalVisible(true);
      return;
    }
    if (
      workspaceInvitationQueryResult.data?.workspaceInvitation === undefined ||
      workspaceInvitationQueryResult.data?.workspaceInvitation === null
    ) {
      return;
    }

    try {
      setIsSubmitting(true);

      let userChainState: userChain.UserChainState | undefined = undefined;
      const userChainQueryResult = await runUserChainQuery({});
      if (userChainQueryResult.data?.userChain?.nodes) {
        userChainState = userChain.resolveState({
          events: userChainQueryResult.data.userChain.nodes
            .filter(notNull)
            .map((event) => {
              const data = userChain.UserChainEvent.parse(
                JSON.parse(event.serializedContent)
              );
              return data;
            }),
          knownVersion: userChain.version,
        }).currentState;
      }

      if (!userChainState) {
        throw new Error("userChainState not available");
      }

      const workspaceId = await acceptWorkspaceInvitation({
        invitationId: workspaceInvitationId,
        mainDevice,
        signingKeyPairSeed,
        expiresAt:
          workspaceInvitationQueryResult.data.workspaceInvitation.expiresAt,
        role: workspaceInvitationQueryResult.data.workspaceInvitation.role,
        workspaceId:
          workspaceInvitationQueryResult.data.workspaceInvitation.workspaceId,
        invitationDataSignature:
          workspaceInvitationQueryResult.data.workspaceInvitation
            .invitationDataSignature,
        invitationSigningPublicKey:
          workspaceInvitationQueryResult.data.workspaceInvitation
            .invitationSigningPublicKey,
        currentUserId: userChainState.id,
        currentUserChainHash: userChainState.eventHash,
      });
      props.navigation.navigate("Workspace", {
        workspaceId: workspaceId,
        screen: "WorkspaceDrawer",
        params: {
          screen: "WorkspaceRoot",
        },
      });
    } catch (error) {
      setHasGraphqlError(true);
      console.error(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };
  const switchToRegisterForm = () => {
    setAuthForm("register");
  };

  const switchToLoginForm = () => {
    setAuthForm("login");
  };

  const onRegisterSuccess = async (
    username: string,
    verificationCode: string
  ) => {
    props.navigation.navigate("RegistrationVerification", {
      username,
      verification: verificationCode,
    });
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

  if (!signingKeyPairSeed) {
    return (
      <ErrorWrapper>
        <InfoMessage variant="error" icon>
          You have not provided a "#key=" parameter in the URL Without the
          proper key, you cannot join this workspace.
        </InfoMessage>
      </ErrorWrapper>
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
        <Heading lvl={1}>Hi there!</Heading>
        <Description variant="login">
          You have been invited to join a workspace by{" "}
          <Description variant="login" bold>
            {
              workspaceInvitationQueryResult.data?.workspaceInvitation
                ?.inviterUsername
            }
          </Description>
        </Description>

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
            onPress={acceptAndGoToWorkspace}
            style={tw`self-center mt-2`}
            isLoading={isSubmitting}
          >
            Accept invitation
          </Button>
          <View style={tw`mt-2 text-center`}>
            <Link to={{ screen: "Root" }}>Ignore invitation</Link>
          </View>
          {activeDevice && (
            <VerifyPasswordModal
              isVisible={isPasswordModalVisible}
              description="Creating a workspace invitation requires access to the main account and therefore verifying your password is required"
              onSuccess={() => {
                setIsPasswordModalVisible(false);
                acceptAndGoToWorkspace();
              }}
              onCancel={() => {
                setIsPasswordModalVisible(false);
              }}
            />
          )}
        </>
      ) : (
        <>
          {authForm === "login" ? (
            <>
              <LoginForm
                onLoginSuccess={acceptAndGoToWorkspace}
                isFocused={true}
              />
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
                workspaceInvitationKey={signingKeyPairSeed}
                onRegisterSuccess={onRegisterSuccess}
                isFocused={true}
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
