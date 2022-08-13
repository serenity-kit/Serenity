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
import { Device } from "../../types/Device";
import { WorkspaceDrawerScreenProps } from "../../types/navigation";
import { createWorkspaceKeyAndCipherTextForDevice } from "../../utils/device/createWorkspaceKeyAndCipherTextForDevice";
import { decryptWorkspaceKey } from "../../utils/device/decryptWorkspaceKey";
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
  const [, attatchDeviceToWorkspaces] = useAttachDeviceToWorkspacesMutation();

  const doActiveDeviceToAttachDeviceToWorkspaces = async (device: Device) => {
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
    if (!mainDeviceWorkspaceDetails?.currentWorkspaceKey?.workspaceKeyBox) {
      // TODO: handle a no matching key boxes found error
      console.log("No workspaceKeyBox found for mainDevice!");
      return;
    }
    const mainDeviceWorkspaceBox =
      mainDeviceWorkspaceDetails?.currentWorkspaceKey?.workspaceKeyBox;
    if (!mainDevice.encryptionPrivateKey) {
      // TODO: handle a no main device encryption private key
      console.log("main device doesn't have an encryption private key!");
      return;
    }
    const workspaceKey = await decryptWorkspaceKey({
      creatorDeviceEncryptionPublicKey: mainDevice.encryptionPublicKey,
      receiverDeviceEncryptionPrivateKey: mainDevice.encryptionPrivateKey,
      nonce: mainDeviceWorkspaceBox.nonce,
      ciphertext: mainDeviceWorkspaceBox.ciphertext,
    });
    const activeDevice = await getActiveDevice();
    if (!activeDevice) {
      // TODO: handle this error
      console.error("No active device!");
    }
    const { nonce, ciphertext } =
      await createWorkspaceKeyAndCipherTextForDevice({
        receiverDeviceEncryptionPublicKey: activeDevice?.encryptionPublicKey!,
        creatorDeviceEncryptionPrivateKey: activeDevice?.encryptionPrivateKey!,
        nonce: mainDeviceWorkspaceBox.nonce,
        workspaceKey,
      });
    await attatchDeviceToWorkspaces({
      input: {
        receiverDeviceSigningPublicKey: device.signingPublicKey,
        creatorDeviceSigningPublicKey: device.signingPublicKey,
        deviceWorkspaceKeyBoxes: [
          {
            workspaceId,
            nonce,
            ciphertext,
          },
        ],
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
        props.navigation.replace("WorkspaceNotFound");
        return;
      } else {
        // check if this workspace has keys for this device
        // if for example we are logging in with a new webDevice, we need
        // to generate keys for this workspace
        const workspace = workspaceResult.data?.workspace;
        if (workspace?.currentWorkspaceKey?.workspaceKeyBox) {
          // use the mainDevice to decrypt the workspace key
          await doActiveDeviceToAttachDeviceToWorkspaces(device);
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
