import { LocalDevice } from "@serenity-tools/common";
import {
  AttachDevicesToWorkspacesDocument,
  AttachDevicesToWorkspacesMutation,
  AttachDevicesToWorkspacesMutationVariables,
} from "../../generated/graphql";
import { getUrqlClient } from "../urqlClient/urqlClient";
import { createWorkspaceMemberDevices } from "./createWorkspaceMemberDevices";
import { getUnauthorizedWorkspaceDevices } from "./getUnauthorizedWorkspaceDevices";

export type Props = {
  activeDevice: LocalDevice;
};
export const authorizeNewDevices = async ({ activeDevice }: Props) => {
  const unauthorizedWorkspaceDevices = await getUnauthorizedWorkspaceDevices(
    {}
  );
  if (
    !unauthorizedWorkspaceDevices ||
    unauthorizedWorkspaceDevices.length === 0
  ) {
    // nothing to do
    return;
  }
  const workspaceMemberDevices = await createWorkspaceMemberDevices({
    unauthorizedWorkspaceDevices,
    activeDevice,
  });
  await getUrqlClient()
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
