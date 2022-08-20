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
  urqlClient: Client;
};
export const attachDeviceToWorkspaces = async ({ urqlClient }: Props) => {
  const activeDevice = await getActiveDevice();
  if (!activeDevice) {
    // TODO: handle this error
    throw new Error("No active device found!");
  }
  const devices = await getDevices({ urqlClient });
  if (!devices) {
    // TODO: handle this erros
    throw new Error("No devices found!");
  }
  const { deviceWorkspaceKeyBoxes, creatorDevice, receiverDevice } =
    await createNewWorkspaceKeyBoxesForActiveDevice({ urqlClient });
  await urqlClient
    .mutation<
      AttachDeviceToWorkspacesMutation,
      AttachDeviceToWorkspacesMutationVariables
    >(
      AttachDeviceToWorkspacesDocument,
      {
        input: {
          creatorDeviceSigningPublicKey: creatorDevice?.signingPublicKey!,
          deviceWorkspaceKeyBoxes,
          receiverDeviceSigningPublicKey: receiverDevice.signingPublicKey,
        },
      },
      {
        requestPolicy: "network-only",
      }
    )
    .toPromise();
};
