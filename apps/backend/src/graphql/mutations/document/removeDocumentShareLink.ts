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

export const SnapshotDeviceKeyBoxInput = inputObjectType({
  name: "SnapshotDeviceKeyBoxInput",
  definition(t) {
    t.nonNull.string("ciphertext");
    t.nonNull.string("nonce");
    t.nonNull.string("deviceSigningPublicKey");
  },
});

export const RemoveDocumentShareLinkInput = inputObjectType({
  name: "CreateDocumentShareLinkInput",
  definition(t) {
    t.nonNull.string("token");
    t.nonNull.field("creatorDevice", { type: CreatorDeviceInput });
    t.nonNull.list.nonNull.field("snapshotDeviceKeyBoxes", {
      type: SnapshotDeviceKeyBoxInput,
    });
  },
});

export const RemoveDocumentShareLinkResult = objectType({
  name: "CreateDocumentShareLinkResult",
  definition(t) {
    t.nonNull.boolean("success");
  },
});

export const createDocumentLinkShareMutation = mutationField(
  "createDocumentShareLink",
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
        snapshotDeviceKeyBoxes: args.input.snapshotDeviceKeyBoxes,
      });
      return {
        succes: true,
      };
    },
  }
);
