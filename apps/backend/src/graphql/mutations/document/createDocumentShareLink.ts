import * as documentChain from "@serenity-kit/document-chain";
import { AuthenticationError, UserInputError } from "apollo-server-express";
import {
  arg,
  inputObjectType,
  mutationField,
  nonNull,
  objectType,
} from "nexus";
import { createDocumentShareLink } from "../../../database/document/createDocumentShareLink";

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
    t.nonNull.string("deviceSecretBoxCiphertext");
    t.nonNull.string("deviceSecretBoxNonce");
    t.nonNull.field("snapshotDeviceKeyBox", {
      type: SnapshotDeviceKeyBoxInput,
    });
    t.nonNull.string("serializedDocumentChainEvent");
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

      const documentChainEvent =
        documentChain.AddShareDocumentDeviceEvent.parse(
          JSON.parse(args.input.serializedDocumentChainEvent)
        );

      if (
        documentChainEvent.author.publicKey !==
        context.user.mainDeviceSigningPublicKey
      ) {
        throw new UserInputError("Not the user's main device");
      }

      const documentShareLink = await createDocumentShareLink({
        sharerUserId: context.user.id,
        documentId: args.input.documentId,
        deviceSecretBoxCiphertext: args.input.deviceSecretBoxCiphertext,
        deviceSecretBoxNonce: args.input.deviceSecretBoxNonce,
        snapshotDeviceKeyBox: args.input.snapshotDeviceKeyBox,
        documentChainEvent,
      });
      return {
        token: documentShareLink.token,
      };
    },
  }
);
