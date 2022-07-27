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
  useAttachDeviceToWorkspaceMutation,
  WorkspaceDocument,
  WorkspaceQuery,
  WorkspaceQueryVariables,
} from "../../generated/graphql";
import { Device } from "../../types/Device";
import { WorkspaceDrawerScreenProps } from "../../types/navigation";
import { createAeadKeyAndCipherTextForDevice } from "../../utils/device/createAeadKeyAndCipherTextForDevice";
import { decryptAeadkey } from "../../utils/device/decryptAeadKey";
import { getActiveDevice } from "../../utils/device/getActiveDevice";
import { getMainDevice } from "../../utils/device/mainDeviceMemoryStore";
import { getLastUsedDocumentId } from "../../utils/lastUsedWorkspaceAndDocumentStore/lastUsedWorkspaceAndDocumentStore";
import { getWorkspace } from "../../utils/workspace/getWorkspace";

export default function WorkspaceRootScreen(
  props: WorkspaceDrawerScreenProps<"WorkspaceRoot">
) {
  useWindowDimensions(); // needed to ensure tw-breakpoints are triggered when resizing
  const urqlClient = useClient();
  const workspaceId = useWorkspaceId();
  const { sessionKey } = useAuthentication();
  const [, attatchDeviceToWorkspace] = useAttachDeviceToWorkspaceMutation();

  const useMainDeviceToAttachDeviceToWorkspace = async (device: Device) => {
    if (!sessionKey) {
      // TODO: handle a no session key error
      console.log("No session key found!");
      return;
    }
    const mainDevice = getMainDevice();
    if (!mainDevice) {
      // TODO: handle a no main device error
      console.log("No main device found!");
      return;
    }
    const mainDeviceWorkspaceDetails = await getWorkspace({
      workspaceId,
      deviceSigningPublicKey: mainDevice.signingPublicKey,
      urqlClient,
    });
    if (!mainDeviceWorkspaceDetails?.currentWorkspaceKey?.workspaceKeyBoxes) {
      // TODO: handle a no matching key boxes found error
      console.log("No workspaceKeyBoxes found for mainDevice!");
      return;
    }
    const mainDeviceWorkspaceBox =
      mainDeviceWorkspaceDetails?.currentWorkspaceKey?.workspaceKeyBoxes[0];
    if (!mainDevice.encryptionPrivateKey) {
      // TODO: handle a no main device encryption private key
      console.log("main device doesn't have an encryption private key!");
      return;
    }
    const aeadKey = await decryptAeadkey({
      deviceEncryptionPrivateKey: mainDevice.encryptionPrivateKey,
      nonce: mainDeviceWorkspaceBox.nonce,
      ciphertext: mainDeviceWorkspaceBox.ciphertext,
    });
    const { nonce, ciphertext } = await createAeadKeyAndCipherTextForDevice({
      deviceEncryptionPublicKey: device.encryptionPublicKey,
      aeadKey,
    });
    await attatchDeviceToWorkspace({
      input: {
        nonce,
        ciphertext,
        signingPublicKey: device.signingPublicKey,
        workspaceId,
      },
    });
  };

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
        const workspace = workspaceResult.data?.workspace;
        if (workspace?.currentWorkspaceKey?.workspaceKeyBoxes.length === 0) {
          // use the mainDevice to decrypt the aeadkey
          await useMainDeviceToAttachDeviceToWorkspace(device);
        }
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
