import {
  StyleSheet,
  TouchableOpacity,
  useWindowDimensions,
} from "react-native";

import { Spinner, Text, View } from "@serenity-tools/ui";
import { useEffect } from "react";
import { Client, useClient } from "urql";
import {
  IsWorkspaceAuthorizedDocument,
  IsWorkspaceAuthorizedQuery,
  IsWorkspaceAuthorizedQueryVariables,
  MeDocument,
  MeQuery,
  MeQueryVariables,
  WorkspaceDocument,
  WorkspaceQuery,
  WorkspaceQueryVariables,
} from "../../generated/graphql";
import { RootStackScreenProps } from "../../types/navigation";
import { getActiveDevice } from "../../utils/device/getActiveDevice";
import {
  getLastUsedWorkspaceId,
  removeLastUsedDocumentId,
  removeLastUsedWorkspaceId,
} from "../../utils/lastUsedWorkspaceAndDocumentStore/lastUsedWorkspaceAndDocumentStore";

export default function WorkspaceNotDecryptedScreen({
  navigation,
  route,
}: RootStackScreenProps<"WorkspaceNotDecrypted">) {
  useWindowDimensions(); // needed to ensure tw-breakpoints are triggered when resizing
  console.log();
  const workspaceId = route.params?.workspaceId;

  const urqlClient = useClient();
  const secondsBetweenAuthorizationChecks = 10;

  useEffect(() => {
    checkForAuthorization();
  }, []);

  const getMe = async () => {
    const meResult = await urqlClient
      .query<MeQuery, MeQueryVariables>(
        MeDocument,
        {},
        {
          requestPolicy: "network-only",
        }
      )
      .toPromise();
    if (meResult.error) {
      throw new Error(meResult.error.message);
    }
    return meResult.data?.me;
  };

  const checkForAuthorization = async () => {
    // TODO: check if user is authorized
    const me = await getMe();
    const isUserMember = await isUserAMemberOfWorkspace({
      urqlClient,
      workspaceId,
    });
    if (!isUserMember) {
      navigation.replace("WorkspaceNotFound");
      return;
    }
    const isAuthorized = await isWorkspaceAuthorized({
      urqlClient,
      workspaceId,
    });
    if (isAuthorized) {
      navigation.navigate("Workspace", {
        workspaceId,
        screen: "WorkspaceRoot",
      });
      return;
    }
    setTimeout(() => {
      checkForAuthorization();
    }, secondsBetweenAuthorizationChecks * 1000);
  };

  const isUserAMemberOfWorkspace = async ({
    urqlClient,
    workspaceId,
  }: {
    urqlClient: Client;
    workspaceId: string;
  }) => {
    const activeDevice = await getActiveDevice();
    if (!activeDevice) {
      // TODO create UI for these errors
      throw new Error("No active device found!");
    }
    const deviceSigningPublicKey = activeDevice?.signingPublicKey;
    const workspaceResult = await urqlClient
      .query<WorkspaceQuery, WorkspaceQueryVariables>(
        WorkspaceDocument,
        {
          id: workspaceId,
          deviceSigningPublicKey,
        },
        { requestPolicy: "network-only" }
      )
      .toPromise();
    if (workspaceResult.data?.workspace === null) {
      return false;
    }
    return true;
  };

  const isWorkspaceAuthorized = async ({
    urqlClient,
    workspaceId,
  }: {
    urqlClient: Client;
    workspaceId: string;
  }) => {
    const isAuthorizedResult = await urqlClient
      .query<IsWorkspaceAuthorizedQuery, IsWorkspaceAuthorizedQueryVariables>(
        IsWorkspaceAuthorizedDocument,
        { workspaceId },
        {
          requestPolicy: "network-only",
        }
      )
      .toPromise();

    if (isAuthorizedResult.error) {
      console.error(isAuthorizedResult.error);
      // throw new Error(isAuthorizedResult.error.message);
    }
    const isAuthorized =
      isAuthorizedResult.data?.isWorkspaceAuthorized?.isAuthorized || false;
    return isAuthorized;
  };

  const removeLastUsedWorkspaceIdAndNavigateToRoot = async () => {
    const workspaceId = await getLastUsedWorkspaceId();
    if (workspaceId) {
      removeLastUsedDocumentId(workspaceId);
    }
    await removeLastUsedWorkspaceId();
    navigation.replace("Root");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        You must wait for your workspace to be decrypted by another member.
      </Text>
      <View style={styles.activityIndicatorContainer}>
        <Spinner style={styles.activityIndicator} />
        Waiting for authorization
      </View>
      <TouchableOpacity
        onPress={removeLastUsedWorkspaceIdAndNavigateToRoot}
        style={styles.link}
      >
        <Text style={styles.linkText}>Go to home</Text>
      </TouchableOpacity>
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
