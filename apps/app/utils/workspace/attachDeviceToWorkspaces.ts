import { LocalDevice } from "@serenity-tools/common";
import {
  AttachDeviceToWorkspacesDocument,
  AttachDeviceToWorkspacesMutation,
  AttachDeviceToWorkspacesMutationVariables,
} from "../../generated/graphql";
import { createNewWorkspaceKeyBoxesForActiveDevice } from "../device/createNewWorkspaceKeyBoxesForActiveDevice";
import { getDevices } from "../device/getDevices";
import { getUrqlClient } from "../urqlClient/urqlClient";

export type Props = {
  activeDevice: LocalDevice;
};
export const attachDeviceToWorkspaces = async ({ activeDevice }: Props) => {
  const devices = await getDevices({ onlyNotExpired: true });
  if (!devices) {
    // TODO: handle this erros
    throw new Error("No devices found!");
  }
  const { deviceWorkspaceKeyBoxes, creatorDevice, receiverDevice } =
    await createNewWorkspaceKeyBoxesForActiveDevice({
      activeDevice,
    });
  await getUrqlClient()
    .mutation<
      AttachDeviceToWorkspacesMutation,
      AttachDeviceToWorkspacesMutationVariables
    >(
      AttachDeviceToWorkspacesDocument,
      {
        input: {
          creatorDeviceSigningPublicKey: creatorDevice.signingPublicKey!,
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
