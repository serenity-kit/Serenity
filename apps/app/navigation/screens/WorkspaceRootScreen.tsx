import { Spinner, tw, View } from "@serenity-tools/ui";
import { useEffect } from "react";
import { useWindowDimensions } from "react-native";
import { useClient } from "urql";
import { useAuthentication } from "../../context/AuthenticationContext";
import { useWorkspaceId } from "../../context/WorkspaceIdContext";
import {
  FirstDocumentDocument,
  FirstDocumentQuery,
  FirstDocumentQueryVariables,
  useAttachDeviceToWorkspacesMutation,
  WorkspaceDocument,
  WorkspaceQuery,
  WorkspaceQueryVariables,
} from "../../generated/graphql";
import { WorkspaceDrawerScreenProps } from "../../types/navigation";
import { buildDeviceWorkspaceKeyBoxes } from "../../utils/device/buildDeviceWorkspaceKeyBoxes";
import { getActiveDevice } from "../../utils/device/getActiveDevice";
import { getDevices } from "../../utils/device/getDevices";
import { getLastUsedDocumentId } from "../../utils/lastUsedWorkspaceAndDocumentStore/lastUsedWorkspaceAndDocumentStore";

export default function WorkspaceRootScreen(
  props: WorkspaceDrawerScreenProps<"WorkspaceRoot">
) {
  useWindowDimensions(); // needed to ensure tw-breakpoints are triggered when resizing
  const urqlClient = useClient();
  const workspaceId = useWorkspaceId();
  const { sessionKey } = useAuthentication();
  const [, attachDeviceToWorkspacesMutation] =
    useAttachDeviceToWorkspacesMutation();

  useEffect(() => {
    (async () => {
      if (!sessionKey) {
        // TODO: handle this error
        console.error("No sessionKey found, probably you aren't logged in");
        return;
      }
      const activeDevice = await getActiveDevice();
      if (!activeDevice) {
        // TODO: handle this error
        console.error("No active device found");
        return;
      }
      const deviceSigningPublicKey: string = activeDevice?.signingPublicKey;
      const devices = await getDevices({ urqlClient });
      if (!devices) {
        // TODO: handle this erros
        console.error("No devices found!");
        return;
      }
      const { existingWorkspaceDeviceWorkspaceKeyBoxes } =
        await buildDeviceWorkspaceKeyBoxes({
          workspaceId,
          devices,
        });
      await attachDeviceToWorkspacesMutation({
        input: {
          creatorDeviceSigningPublicKey: deviceSigningPublicKey,
          deviceWorkspaceKeyBoxes: existingWorkspaceDeviceWorkspaceKeyBoxes,
          receiverDeviceSigningPublicKey: deviceSigningPublicKey,
        },
      });
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
        props.navigation.replace("WorkspaceNotFound");
        return;
      }
      const lastUsedDocumentId = await getLastUsedDocumentId(workspaceId);
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
        props.navigation.replace("WorkspaceNotFound");
      }
    })();
  }, [urqlClient, props.navigation, workspaceId]);

  return (
    <View style={tw`justify-center items-center flex-auto`}>
      <Spinner fadeIn size="lg" />
    </View>
  );
}
