import * as documentChain from "@serenity-kit/document-chain";
import { AuthenticationError, UserInputError } from "apollo-server-express";
import {
  arg,
  inputObjectType,
  mutationField,
  nonNull,
  objectType,
} from "nexus";
import { removeDocumentShareLink } from "../../../database/document/removeDocumentShareLink";

export const RemoveDocumentShareLinkInput = inputObjectType({
  name: "RemoveDocumentShareLinkInput",
  definition(t) {
    t.nonNull.string("serializedDocumentChainEvent");
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

      const documentChainEvent =
        documentChain.RemoveShareDocumentDeviceEvent.parse(
          JSON.parse(args.input.serializedDocumentChainEvent)
        );

      if (
        documentChainEvent.author.publicKey !==
        context.user.mainDeviceSigningPublicKey
      ) {
        throw new UserInputError("Not the user's main device");
      }

      await removeDocumentShareLink({
        userId: context.user.id,
        documentChainEvent,
      });
      return {
        success: true,
      };
    },
  }
);
