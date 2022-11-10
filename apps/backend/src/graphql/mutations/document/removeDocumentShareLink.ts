import { AuthenticationError } from "apollo-server-express";
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
    t.nonNull.string("token");
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
      await removeDocumentShareLink({
        token: args.input.token,
        sharerUserId: context.user.id,
      });
      return {
        success: true,
      };
    },
  }
);
