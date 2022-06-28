import { Spinner, tw, View } from "@serenity-tools/ui";
import { useEffect } from "react";
import { useWindowDimensions } from "react-native";
import { useClient } from "urql";
import { useAuthentication } from "../../context/AuthenticationContext";
import { WorkspaceDocument, WorkspaceQuery } from "../../generated/graphql";
import { RootStackScreenProps } from "../../types";
import { getLastUsedWorkspaceId } from "../../utils/lastUsedWorkspaceAndDocumentStore/lastUsedWorkspaceAndDocumentStore";

export default function RootScreen(props: RootStackScreenProps<"Root">) {
  useWindowDimensions(); // needed to ensure tw-breakpoints are triggered when resizing
  const urqlClient = useClient();
  const { sessionKey } = useAuthentication();

  useEffect(() => {
    if (sessionKey) {
      (async () => {
        const lastUsedWorkspaceId = await getLastUsedWorkspaceId();
        if (lastUsedWorkspaceId) {
          props.navigation.replace("Workspace", {
            workspaceId: lastUsedWorkspaceId,
            screen: "WorkspaceRoot",
          });
          return;
        }

        const workspaceResult = await urqlClient
          .query<WorkspaceQuery>(WorkspaceDocument, undefined, {
            // better to be safe here and always refetch
            requestPolicy: "network-only",
          })
          .toPromise();
        if (workspaceResult.data?.workspace?.id) {
          // query first document on first workspace and go there
          props.navigation.replace("Workspace", {
            workspaceId: workspaceResult.data.workspace.id,
            screen: "WorkspaceRoot",
          });
        } else {
          props.navigation.replace("Onboarding");
        }
      })();
    } else {
      props.navigation.replace("Register");
    }
  }, [sessionKey, urqlClient, props.navigation]);

  return (
    <View style={tw`justify-center items-center flex-auto`}>
      <Spinner fadeIn size="lg" />
    </View>
  );
}
