import { AuthenticationError } from "apollo-server-express";
import {
  arg,
  inputObjectType,
  mutationField,
  nonNull,
  objectType,
} from "nexus";
import { updateWorkspaceInfo } from "../../../database/workspace/updateWorkspaceInfo";
import { Workspace } from "../../types/workspace";

export const InfoWorkspaceKeyBoxInput = inputObjectType({
  name: "InfoWorkspaceKeyBoxInput",
  definition(t) {
    t.nonNull.string("ciphertext");
    t.nonNull.string("nonce");
    t.nonNull.string("deviceSigningPublicKey");
  },
});

export const UpdateWorkspaceInfoInput = inputObjectType({
  name: "UpdateWorkspaceInfoInput",
  definition(t) {
    t.nonNull.string("workspaceId");
    t.nonNull.string("infoCiphertext");
    t.nonNull.string("infoNonce");
    t.nonNull.string("creatorDeviceSigningPublicKey");
    t.nonNull.list.nonNull.field("infoWorkspaceKeyBoxes", {
      type: InfoWorkspaceKeyBoxInput,
    });
  },
});

export const UpdateWorkspaceInfoResult = objectType({
  name: "UpdateWorkspaceInfoResult",
  definition(t) {
    t.nonNull.field("workspace", {
      type: Workspace,
    });
  },
});

export const updateWorkspaceInfoMutation = mutationField(
  "updateWorkspaceInfo",
  {
    type: UpdateWorkspaceInfoResult,
    args: {
      input: nonNull(
        arg({
          type: UpdateWorkspaceInfoInput,
        })
      ),
    },
    async resolve(_root, args, context) {
      console.log({
        deviceSigningPublicKey: context.session.deviceSigningPublicKey,
      });
      if (!context.user) {
        throw new AuthenticationError("Not authenticated");
      }
      context.assertValidDeviceSigningPublicKeyForThisSession(
        args.input.creatorDeviceSigningPublicKey
      );

      const workspace = await updateWorkspaceInfo({
        userId: context.user.id,
        workspaceId: args.input.workspaceId,
        infoCiphertext: args.input.infoCiphertext,
        infoNonce: args.input.infoNonce,
        creatorDeviceSigningPublicKey: args.input.creatorDeviceSigningPublicKey,
        sessionDeviceSigningPublicKey: context.session.deviceSigningPublicKey,
        infoWorkspaceKeyBoxes: args.input.infoWorkspaceKeyBoxes,
      });
      return { workspace };
    },
  }
);
