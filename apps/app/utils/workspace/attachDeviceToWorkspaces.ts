import { Client } from "urql";
import {
  AttachDeviceToWorkspacesDocument,
  AttachDeviceToWorkspacesMutation,
  AttachDeviceToWorkspacesMutationVariables,
} from "../../generated/graphql";
import { buildDeviceWorkspaceKeyBoxes } from "../device/buildDeviceWorkspaceKeyBoxes";
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
  console.log({ activeDevice });
  const deviceSigningPublicKey = activeDevice.signingPublicKey;
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
  await urqlClient
    .mutation<
      AttachDeviceToWorkspacesMutation,
      AttachDeviceToWorkspacesMutationVariables
    >(
      AttachDeviceToWorkspacesDocument,
      {
        input: {
          creatorDeviceSigningPublicKey: deviceSigningPublicKey,
          deviceWorkspaceKeyBoxes: existingWorkspaceDeviceWorkspaceKeyBoxes,
          receiverDeviceSigningPublicKey: deviceSigningPublicKey,
        },
      },
      {
        requestPolicy: "network-only",
      }
    )
    .toPromise();
};
