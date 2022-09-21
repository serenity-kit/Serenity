import { Client } from "urql";
import {
  AttachDeviceToWorkspacesDocument,
  AttachDeviceToWorkspacesMutation,
  AttachDeviceToWorkspacesMutationVariables,
} from "../../generated/graphql";
import { Device } from "../../types/Device";
import { createNewWorkspaceKeyBoxesForActiveDevice } from "../device/createNewWorkspaceKeyBoxesForActiveDevice";
import { getDevices } from "../device/getDevices";

export type Props = {
  urqlClient: Client;
  activeDevice: Device;
};
export const attachDeviceToWorkspaces = async ({
  urqlClient,
  activeDevice,
}: Props) => {
  const devices = await getDevices({ urqlClient });
  if (!devices) {
    // TODO: handle this erros
    throw new Error("No devices found!");
  }
  const { deviceWorkspaceKeyBoxes, creatorDevice, receiverDevice } =
    await createNewWorkspaceKeyBoxesForActiveDevice({
      urqlClient,
      activeDevice,
    });
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
