import { AuthenticationError } from "apollo-server-express";
import {
  arg,
  inputObjectType,
  mutationField,
  nonNull,
  objectType,
} from "nexus";
import { removeDocumentShareLink } from "../../../database/document/removeDocumentShareLink";
import { CreatorDeviceInput } from "../../types/device";
import { DocumentSnapshotInput } from "../../types/document";
import { SnapshotDeviceKeyBoxInput } from "./createDocumentShareLink";

export const RemoveDocumentShareLinkInput = inputObjectType({
  name: "RemoveDocumentShareLinkInput",
  definition(t) {
    t.nonNull.string("token");
    t.nonNull.field("creatorDevice", { type: CreatorDeviceInput });
    t.nonNull.field("snapshot", { type: DocumentSnapshotInput });
    t.nonNull.list.nonNull.field("snapshotDeviceKeyBoxes", {
      type: SnapshotDeviceKeyBoxInput,
    });
  },
});

export const RemoveDocumentShareLinkResult = objectType({
  name: "RemoveDocumentShareLinkResult",
  definition(t) {
    t.nonNull.boolean("success");
  },
});

export const removeDocumentLinkShareMutation = mutationField(
  "removeDocumentShareLink",
  {
    type: RemoveDocumentShareLinkResult,
    args: {
      input: nonNull(
        arg({
          type: RemoveDocumentShareLinkInput,
        })
      ),
    },
    async resolve(root, args, context) {
      if (!context.user) {
        throw new AuthenticationError("Not authenticated");
      }
      context.assertValidDeviceSigningPublicKeyForThisSession(
        args.input.creatorDevice.signingPublicKey
      );
      await removeDocumentShareLink({
        token: args.input.token,
        sharerUserId: context.user.id,
        deviceSigningPublicKey: args.input.creatorDevice.signingPublicKey,
        snapshot: args.input.snapshot,
        snapshotDeviceKeyBoxes: args.input.snapshotDeviceKeyBoxes,
      });
      return {
        success: true,
      };
    },
  }
);
