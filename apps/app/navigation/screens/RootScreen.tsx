import { Text, View } from "@serenity-tools/ui";
import { useEffect } from "react";
import { useClient } from "urql";
import { WorkspaceDocument, WorkspaceQuery } from "../../generated/graphql";
import { RootStackScreenProps } from "../../types";

export default function RootScreen(props: RootStackScreenProps<"Root">) {
  const urqlClient = useClient();

  useEffect(() => {
    const deviceSigningPublicKey = localStorage.getItem(
      "deviceSigningPublicKey"
    );

    if (deviceSigningPublicKey) {
      (async () => {
        const workspaceResult = await urqlClient
          .query<WorkspaceQuery>(WorkspaceDocument, undefined, {
            // better to be safe here and always refetch
            requestPolicy: "network-only",
          })
          .toPromise();
        console.log(workspaceResult);
        if (workspaceResult.data?.workspace?.id) {
          // query first document on first workspace and go there
          props.navigation.navigate("Workspace", {
            workspaceId: workspaceResult.data.workspace.id,
            screen: "Dashboard",
          });
        } else {
          props.navigation.navigate("NoWorkspace");
        }
      })();
    } else {
      props.navigation.navigate("Register");
    }
  }, []);
  return (
    <View>
      <Text>Splash Screen (show loading indicator after 200ms)</Text>
    </View>
  );
}
