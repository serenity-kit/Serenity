import { AuthenticationError } from "apollo-server-express";
import {
  arg,
  inputObjectType,
  mutationField,
  nonNull,
  objectType,
} from "nexus";
import { Role } from "../../../../prisma/generated/output";
import { createDocumentShareLink } from "../../../database/document/createDocumentShareLink";
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
    t.nonNull.string("creatorDeviceSigningPublicKey");
    t.nonNull.string("deviceSigningPublicKey");
    t.nonNull.string("deviceEncryptionPublicKey");
    t.nonNull.string("deviceEncryptionPublicKeySignature");
    t.nonNull.field("snapshotDeviceKeyBox", {
      type: SnapshotDeviceKeyBoxInput,
    });
  },
});

export const CreateDocumentShareLinkResult = objectType({
  name: "CreateDocumentShareLinkResult",
  definition(t) {
    t.nonNull.string("token");
    t.nonNull.field("role", { type: MemberRoleEnum });
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
        args.input.creatorDeviceSigningPublicKey
      );
      const documentShareLink = await createDocumentShareLink({
        sharerUserId: context.user.id,
        documentId: args.input.documentId,
        sharingRole: args.input.sharingRole,
        deviceSecretBoxCiphertext: args.input.deviceSecretBoxCiphertext,
        deviceSecretBoxNonce: args.input.deviceSecretBoxNonce,
        creatorDeviceSigningPublicKey: args.input.creatorDeviceSigningPublicKey,
        deviceSigningPublicKey: args.input.deviceSigningPublicKey,
        deviceEncryptionPublicKey: args.input.deviceEncryptionPublicKey,
        deviceEncryptionPublicKeySignature:
          args.input.deviceEncryptionPublicKeySignature,
        snapshotDeviceKeyBox: args.input.snapshotDeviceKeyBox,
      });
      return {
        token: documentShareLink.token,
        role: documentShareLink.role as Role,
      };
    },
  }
);
