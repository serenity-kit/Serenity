import { Text, View } from "@serenity-tools/ui";
import { useEffect } from "react";
import { useWindowDimensions, Platform } from "react-native";
import { useClient } from "urql";
import { useAuthentication } from "../../context/AuthenticationContext";
import { WorkspaceDocument, WorkspaceQuery } from "../../generated/graphql";
import { RootStackScreenProps } from "../../types";

export default function RootScreen(props: RootStackScreenProps<"Root">) {
  useWindowDimensions(); // needed to ensure tw-breakpoints are triggered when resizing
  const urqlClient = useClient();
  const { deviceSigningPublicKey } = useAuthentication();

  useEffect(() => {
    if (deviceSigningPublicKey) {
      (async () => {
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
            screen: "Dashboard",
          });
        } else {
          props.navigation.replace("NoWorkspace");
        }
      })();
    } else {
      props.navigation.replace("Register");
    }
  }, [deviceSigningPublicKey, urqlClient, props.navigation]);

  return (
    <View>
      <Text>Splash Screen (show loading indicator after 200ms)</Text>
    </View>
  );
}
