import { Spinner, tw, View } from "@serenity-tools/ui";
import { useEffect } from "react";
import { useWindowDimensions } from "react-native";
import { useClient } from "urql";
import { useAuthentication } from "../../context/AuthenticationContext";
import { RootStackScreenProps } from "../../types/navigation";
import { getActiveDevice } from "../../utils/device/getActiveDevice";
import { getLastUsedWorkspaceId } from "../../utils/lastUsedWorkspaceAndDocumentStore/lastUsedWorkspaceAndDocumentStore";
import { getWorkspace } from "../../utils/workspace/getWorkspace";

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
        try {
          const device = await getActiveDevice();
          if (!device) {
            // TODO: handle a no device error
            console.error("Error fetching active device.");
            return;
          }
          const workspace = await getWorkspace({
            urqlClient,
            deviceSigningPublicKey: device?.signingPublicKey,
          });
          if (workspace?.id) {
            // query first document on first workspace and go there
            props.navigation.replace("Workspace", {
              workspaceId: workspace.id,
              screen: "WorkspaceRoot",
            });
          } else {
            props.navigation.replace("Onboarding");
          }
        } catch (error) {
          // TODO: handle workspace fetch error
          console.error("Error fetching last used workspaceId.");
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
