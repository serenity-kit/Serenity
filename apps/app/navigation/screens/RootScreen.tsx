import { CenterContent, Spinner } from "@serenity-tools/ui";
import { useEffect } from "react";
import { useWindowDimensions } from "react-native";
import { useClient } from "urql";
import { useAppContext } from "../../context/AppContext";
import { RootStackScreenProps } from "../../types/navigation";
import { getLastUsedWorkspaceId } from "../../utils/lastUsedWorkspaceAndDocumentStore/lastUsedWorkspaceAndDocumentStore";
import { getWorkspace } from "../../utils/workspace/getWorkspace";

export default function RootScreen(props: RootStackScreenProps<"Root">) {
  useWindowDimensions(); // needed to ensure tw-breakpoints are triggered when resizing
  const urqlClient = useClient();
  const { sessionKey, activeDevice } = useAppContext();

  useEffect(() => {
    if (sessionKey && activeDevice) {
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
          const workspace = await getWorkspace({
            urqlClient,
            deviceSigningPublicKey: activeDevice.signingPublicKey,
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
          console.log(error);
        }
      })();
    } else {
      props.navigation.replace("Register");
    }
  }, [sessionKey, urqlClient, props.navigation, activeDevice]);

  return (
    <CenterContent>
      <Spinner fadeIn size="lg" />
    </CenterContent>
  );
}
