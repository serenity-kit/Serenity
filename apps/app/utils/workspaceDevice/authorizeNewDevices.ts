import { Client } from "urql";
import {
  AttachDevicesToWorkspacesDocument,
  AttachDevicesToWorkspacesMutation,
  AttachDevicesToWorkspacesMutationVariables,
} from "../../generated/graphql";
import { getActiveDevice } from "../device/getActiveDevice";
import { createWorkspaceMemberDevices } from "./createWorkspaceMemberDevices";
import { getUnauthorizedWorkspaceDevices } from "./getUnauthorizedWorkspaceDevices";

export type Props = {
  urqlClient: Client;
};
export const authorizeNewDevices = async ({ urqlClient }: Props) => {
  const activeDevice = await getActiveDevice();
  if (!activeDevice) {
    // TODO: handle this error
    throw new Error("No active device found!");
  }
  const unauthorizedWorkspaceDevices = await getUnauthorizedWorkspaceDevices({
    urqlClient,
  });
  if (
    !unauthorizedWorkspaceDevices ||
    unauthorizedWorkspaceDevices.length === 0
  ) {
    // nothing to do
    return;
  }
  const workspaceMemberDevices = await createWorkspaceMemberDevices({
    unauthorizedWorkspaceDevices,
    urqlClient,
  });
  await urqlClient
    .mutation<
      AttachDevicesToWorkspacesMutation,
      AttachDevicesToWorkspacesMutationVariables
    >(
      AttachDevicesToWorkspacesDocument,
      {
        input: {
          creatorDeviceSigningPublicKey: activeDevice?.signingPublicKey!,
          workspaceMemberDevices,
        },
      },
      {
        requestPolicy: "network-only",
      }
    )
    .toPromise();
};
