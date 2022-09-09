import {
  StyleSheet,
  TouchableOpacity,
  useWindowDimensions,
} from "react-native";

import { Spinner, Text, View } from "@serenity-tools/ui";
import { useEffect } from "react";
import { useClient } from "urql";
import { useWorkspaceId } from "../../context/WorkspaceIdContext";
import { MeDocument, MeQuery, MeQueryVariables } from "../../generated/graphql";
import { RootStackScreenProps } from "../../types/navigation";
import {
  getLastUsedWorkspaceId,
  removeLastUsedDocumentId,
  removeLastUsedWorkspaceId,
} from "../../utils/lastUsedWorkspaceAndDocumentStore/lastUsedWorkspaceAndDocumentStore";

export default function WorkspaceNotDecryptedScreen({
  navigation,
}: RootStackScreenProps<"NotFound">) {
  useWindowDimensions(); // needed to ensure tw-breakpoints are triggered when resizing
  const workspaceId = useWorkspaceId();
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
    /*
    const isAuthorized = await isWorkspaceAuthorized({ graphql, workspaceId});
    if (isAuthorized) {
        navigation.navigate("Workspace" {
        workspaceId: workspace!.id,
        screen: "WorkspaceRoot",
      });
      return;
    }
    */
    setTimeout(() => {
      checkForAuthorization();
    }, secondsBetweenAuthorizationChecks * 1000);
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
