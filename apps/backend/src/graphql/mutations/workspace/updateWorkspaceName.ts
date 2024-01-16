import { verifyWorkspaceInfoSignature } from "@serenity-tools/common/src/verifyWorkspaceInfoSignature/verifyWorkspaceInfoSignature";
import { AuthenticationError } from "apollo-server-express";
import {
  arg,
  inputObjectType,
  mutationField,
  nonNull,
  objectType,
} from "nexus";
import { getWorkspaceMemberDevicesProof } from "../../../database/workspace/getWorkspaceMemberDevicesProof";
import { updateWorkspaceName } from "../../../database/workspace/updateWorkspaceName";
import { Workspace } from "../../types/workspace";

export const UpdateWorkspaceNameInput = inputObjectType({
  name: "UpdateWorkspaceNameInput",
  definition(t) {
    t.nonNull.string("id");
    t.nonNull.string("infoCiphertext");
    t.nonNull.string("infoNonce");
    t.nonNull.string("infoSignature");
    t.nonNull.string("infoWorkspaceKeyId");
  },
});

export const UpdateWorkspaceNameResult = objectType({
  name: "UpdateWorkspaceNameResult",
  definition(t) {
    t.field("workspace", { type: Workspace });
  },
});

export const updateWorkspaceNameMutation = mutationField(
  "updateWorkspaceName",
  {
    type: UpdateWorkspaceNameResult,
    args: {
      input: nonNull(
        arg({
          type: UpdateWorkspaceNameInput,
        })
      ),
    },
    async resolve(root, args, context) {
      if (!context.user) {
        throw new AuthenticationError("Not authenticated");
      }

      const workspaceMemberDevicesProof = await getWorkspaceMemberDevicesProof({
        workspaceId: args.input.id,
        userId: context.user.id,
      });

      let authorDeviceSigningPublicKey = context.session.deviceSigningPublicKey;

      const validSignatureForSessionDevice = verifyWorkspaceInfoSignature({
        ciphertext: args.input.infoCiphertext,
        nonce: args.input.infoNonce,
        signature: args.input.infoSignature,
        authorSigningPublicKey: context.session.deviceSigningPublicKey,
        workspaceId: args.input.id,
        workspaceKeyId: args.input.infoWorkspaceKeyId,
        workspaceMemberDevicesProof: workspaceMemberDevicesProof.proof,
      });

      if (!validSignatureForSessionDevice) {
        const validSignatureForMainDevice = verifyWorkspaceInfoSignature({
          ciphertext: args.input.infoCiphertext,
          nonce: args.input.infoNonce,
          signature: args.input.infoSignature,
          authorSigningPublicKey: context.user.mainDeviceSigningPublicKey,
          workspaceId: args.input.id,
          workspaceKeyId: args.input.infoWorkspaceKeyId,
          workspaceMemberDevicesProof: workspaceMemberDevicesProof.proof,
        });
        if (validSignatureForMainDevice) {
          authorDeviceSigningPublicKey =
            context.user.mainDeviceSigningPublicKey;
        } else {
          throw new Error("Invalid signature");
        }
      }

      const workspace = await updateWorkspaceName({
        id: args.input.id,
        infoCiphertext: args.input.infoCiphertext,
        infoNonce: args.input.infoNonce,
        infoSignature: args.input.infoSignature,
        infoWorkspaceKeyId: args.input.infoWorkspaceKeyId,
        authorDeviceSigningPublicKey,
        userId: context.user.id,
      });
      return { workspace };
    },
  }
);
