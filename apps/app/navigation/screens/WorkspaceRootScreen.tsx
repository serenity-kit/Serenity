import { Spinner, tw, View } from "@serenity-tools/ui";
import { useEffect } from "react";
import { useWindowDimensions } from "react-native";
import { useClient } from "urql";
import { useWorkspaceId } from "../../context/WorkspaceIdContext";
import {
  FirstDocumentDocument,
  FirstDocumentQuery,
  FirstDocumentQueryVariables,
  WorkspaceDocument,
  WorkspaceQuery,
  WorkspaceQueryVariables,
} from "../../generated/graphql";
import { WorkspaceDrawerScreenProps } from "../../types/navigation";
import { getActiveDevice } from "../../utils/device/getActiveDevice";
import { getLastUsedDocumentId } from "../../utils/lastUsedWorkspaceAndDocumentStore/lastUsedWorkspaceAndDocumentStore";

export default function WorkspaceRootScreen(
  props: WorkspaceDrawerScreenProps<"WorkspaceRoot">
) {
  useWindowDimensions(); // needed to ensure tw-breakpoints are triggered when resizing
  const urqlClient = useClient();
  const workspaceId = useWorkspaceId();

  useEffect(() => {
    (async () => {
      const device = await getActiveDevice();
      if (!device) {
        // TODO: handle this error
        console.error("No active device found");
        return;
      }
      const deviceSigningPublicKey: string = device?.signingPublicKey;
      // check if the user has access to this workspace
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
        console.log("workspaceresult returned null workspace");
        // props.navigation.replace("WorkspaceNotFound");
        // return;
      } else {
        // check if this workspace has keys for this device
        // if for example we are logging in with a new webDevice, we need
        // to generate keys for this workspace
      }
      const lastUsedDocumentId = await getLastUsedDocumentId(workspaceId);
      console.log({ lastUsedDocumentId });
      if (lastUsedDocumentId) {
        props.navigation.replace("Workspace", {
          workspaceId,
          screen: "Page",
          params: {
            pageId: lastUsedDocumentId,
          },
        });
        return;
      }

      // query first folder and then the first document to navigate there
      const firstDocumentResult = await urqlClient
        .query<FirstDocumentQuery, FirstDocumentQueryVariables>(
          FirstDocumentDocument,
          { workspaceId },
          { requestPolicy: "network-only" } // better to be safe here and always refetch
        )
        .toPromise();

      if (firstDocumentResult.data?.firstDocument?.id) {
        props.navigation.replace("Workspace", {
          workspaceId,
          screen: "Page",
          params: {
            pageId: firstDocumentResult.data?.firstDocument?.id,
          },
        });
      } else {
        console.log("first document not found");
        // props.navigation.replace("WorkspaceNotFound");
      }
    })();
  }, [urqlClient, props.navigation]);

  return (
    <View style={tw`justify-center items-center flex-auto`}>
      <Spinner fadeIn size="lg" />
    </View>
  );
}
