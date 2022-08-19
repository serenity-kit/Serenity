import { Client } from "urql";
import {
  AttachDeviceToWorkspacesDocument,
  AttachDeviceToWorkspacesMutation,
  AttachDeviceToWorkspacesMutationVariables,
} from "../../generated/graphql";
import { createNewWorkspaceKeyBoxesForActiveDevice } from "../device/createNewWorkspaceKeyBoxesForActiveDevice";
import { getActiveDevice } from "../device/getActiveDevice";
import { getDevices } from "../device/getDevices";

export type Props = {
  workspaceId?: string;
  urqlClient: Client;
};
export const attachDeviceToWorkspaces = async ({
  workspaceId,
  urqlClient,
}: Props) => {
  const activeDevice = await getActiveDevice();
  if (!activeDevice) {
    // TODO: handle this error
    throw new Error("No active device found!");
  }
  const deviceSigningPublicKey = activeDevice.signingPublicKey;
  const devices = await getDevices({ urqlClient });
  if (!devices) {
    // TODO: handle this erros
    console.error("No devices found!");
    return;
  }
  const deviceWorkspaceKeyBoxes =
    await createNewWorkspaceKeyBoxesForActiveDevice({ urqlClient });
  console.log("attachDeviceToWorkspaces:");
  await urqlClient
    .mutation<
      AttachDeviceToWorkspacesMutation,
      AttachDeviceToWorkspacesMutationVariables
    >(
      AttachDeviceToWorkspacesDocument,
      {
        input: {
          creatorDeviceSigningPublicKey: deviceSigningPublicKey,
          deviceWorkspaceKeyBoxes,
          receiverDeviceSigningPublicKey: deviceSigningPublicKey,
        },
      },
      {
        requestPolicy: "network-only",
      }
    )
    .toPromise();
  console.log("done");
};
