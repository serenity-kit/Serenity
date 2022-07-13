import React, { useState } from "react";
import { View, tw, Box, Text, Link, InfoMessage } from "@serenity-tools/ui";
import { RootStackScreenProps } from "../../types/navigation";
import { LoginForm } from "../../components/login/LoginForm";
import { navigateToNextAuthenticatedPage } from "../../utils/authentication/loginHelper";
import { KeyboardAvoidingView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  useAcceptWorkspaceInvitationMutation,
  Workspace,
} from "../../generated/graphql";
import { useClient } from "urql";
import { getPendingWorkspaceInvitationId } from "../../utils/workspace/getPendingWorkspaceInvitationId";
import { acceptWorkspaceInvitation } from "../../utils/workspace/acceptWorkspaceInvitation";

export default function LoginScreen(props: RootStackScreenProps<"Login">) {
  const [, acceptWorkspaceInvitationMutation] =
    useAcceptWorkspaceInvitationMutation();
  const urqlClient = useClient();
  const [graphqlError, setGraphqlError] = useState("");

  const acceptPendingWorkspaceInvitation = async (): Promise<
    Workspace | undefined
  > => {
    const pendingWorkspaceInvitationId = await getPendingWorkspaceInvitationId({
      urqlClient,
    });
    if (pendingWorkspaceInvitationId) {
      try {
        const workspace = await acceptWorkspaceInvitation({
          workspaceInvitationId: pendingWorkspaceInvitationId,
          acceptWorkspaceInvitationMutation,
        });
        return workspace;
      } catch (error) {
        setGraphqlError(error.message);
      }
    }
  };

  const onLoginSuccess = async (pendingWorkspaceInvitationId: string) => {
    const workspace = await acceptPendingWorkspaceInvitation();
    if (workspace) {
      props.navigation.navigate("Workspace", {
        screen: "WorkspaceRoot",
        workspaceId: workspace.id,
      });
    } else {
      navigateToNextAuthenticatedPage({
        navigation: props.navigation,
        pendingWorkspaceInvitationId: null,
      });
    }
  };
  return (
    <SafeAreaView style={tw`flex-auto`}>
      <KeyboardAvoidingView behavior="padding" style={tw`flex-auto`}>
        <View
          style={tw`bg-white xs:bg-primary-900 justify-center items-center flex-auto`}
        >
          <Box>
            <View>
              <Text variant="large" bold style={tw`text-center`}>
                Welcome back
              </Text>
              <View>
                <Text muted style={tw`text-center`}>
                  Log in to your Serenity Account
                </Text>
              </View>
            </View>
            {graphqlError !== "" && (
              <InfoMessage variant="error">{graphqlError}</InfoMessage>
            )}
            <LoginForm onLoginSuccess={onLoginSuccess} />
            <View style={tw`text-center`}>
              <Text variant="xs" muted>
                Don't have an account?
              </Text>
              <Text variant="xs">
                <Link to={{ screen: "Register" }}>Register here</Link>
              </Text>
            </View>
          </Box>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
