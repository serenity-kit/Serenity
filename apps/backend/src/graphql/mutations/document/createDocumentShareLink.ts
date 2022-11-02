import { AuthenticationError } from "apollo-server-express";
import {
  arg,
  inputObjectType,
  mutationField,
  nonNull,
  objectType,
} from "nexus";
import { createDocumentShareLink } from "../../../database/document/createDocumentShareLink";
import { CreatorDeviceInput } from "../../types/device";
import { MemberRoleEnum } from "../../types/workspace";

export const SnapshotDeviceKeyBoxInput = inputObjectType({
  name: "SnapshotDeviceKeyBoxInput",
  definition(t) {
    t.nonNull.string("ciphertext");
    t.nonNull.string("nonce");
    t.nonNull.string("deviceSigningPublicKey");
  },
});

export const CreateDocumentShareLinkInput = inputObjectType({
  name: "CreateDocumentShareLinkInput",
  definition(t) {
    t.nonNull.string("documentId");
    t.nonNull.field("sharingRole", { type: MemberRoleEnum });
    t.nonNull.string("deviceSecretBoxCiphertext");
    t.nonNull.string("deviceSecretBoxNonce");
    t.nonNull.field("creatorDevice", { type: CreatorDeviceInput });
    t.nonNull.list.nonNull.field("snapshotDeviceKeyBoxes", {
      type: SnapshotDeviceKeyBoxInput,
    });
  },
});

export const CreateDocumentShareLinkResult = objectType({
  name: "CreateDocumentShareLinkResult",
  definition(t) {
    t.nonNull.string("token");
  },
});

export const createDocumentLinkShareMutation = mutationField(
  "createDocumentShareLink",
  {
    type: CreateDocumentShareLinkResult,
    args: {
      input: nonNull(
        arg({
          type: CreateDocumentShareLinkInput,
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
      const documentShareLink = await createDocumentShareLink({
        sharerUserId: context.user.id,
        documentId: args.input.documentId,
        sharingRole: args.input.sharingRole,
        deviceSecretBoxCiphertext: args.input.deviceSecretBoxCiphertext,
        deviceSecretBoxNonce: args.input.deviceSecretBoxNonce,
        deviceSigningPublicKey: args.input.creatorDevice.signingPublicKey,
        deviceEncryptionPublicKey: args.input.creatorDevice.encryptionPublicKey,
        deviceEncryptionPublicKeySignature:
          args.input.creatorDevice.encryptionPublicKeySignature,
        snapshotDeviceKeyBoxes: args.input.snapshotDeviceKeyBoxes,
      });
      return {
        token: documentShareLink.token,
      };
    },
  }
);
