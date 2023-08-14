import * as userChain from "@serenity-kit/user-chain";
import { AuthenticationError } from "apollo-server-express";
import {
  arg,
  inputObjectType,
  mutationField,
  nonNull,
  objectType,
} from "nexus";
import { deleteDevice } from "../../../database/device/deleteDevice";
import { WorkspaceWithWorkspaceDevicesParingInput } from "../../types/workspaceDevice";

export const DeleteDeviceResult = objectType({
  name: "DeleteDeviceResult",
  definition(t) {
    t.nonNull.string("status");
  },
});

export const DeleteDeviceInput = inputObjectType({
  name: "DeleteDeviceInput",
  definition(t) {
    t.nonNull.string("creatorSigningPublicKey");
    t.nonNull.list.nonNull.field("newDeviceWorkspaceKeyBoxes", {
      type: WorkspaceWithWorkspaceDevicesParingInput,
    });
    t.nonNull.string("serializedUserChainEvent");
  },
});

export const deleteDeviceMutation = mutationField("deleteDevice", {
  type: DeleteDeviceResult,
  args: {
    input: nonNull(
      arg({
        type: DeleteDeviceInput,
      })
    ),
  },
  async resolve(root, args, context) {
    if (!context.user) {
      throw new AuthenticationError("Not authenticated");
    }
    context.assertValidDeviceSigningPublicKeyForThisSession(
      args.input.creatorSigningPublicKey
    );

    const removeDeviceEvent = userChain.RemoveDeviceEvent.parse(
      JSON.parse(args.input.serializedUserChainEvent)
    );

    await deleteDevice({
      userId: context.user.id,
      creatorDeviceSigningPublicKey: args.input.creatorSigningPublicKey,
      newDeviceWorkspaceKeyBoxes: args.input.newDeviceWorkspaceKeyBoxes,
      removeDeviceEvent,
    });
    return {
      status: "success",
    };
  },
});