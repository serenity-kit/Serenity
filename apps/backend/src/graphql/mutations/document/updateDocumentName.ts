import { AuthenticationError, UserInputError } from "apollo-server-express";
import { arg, inputObjectType, mutationField, objectType } from "nexus";
import { updateDocumentName } from "../../../database/document/updateDocumentName";
import { Document } from "../../types/document";

export const UpdateDocumentNameInput = inputObjectType({
  name: "UpdateDocumentNameInput",
  definition(t) {
    t.nonNull.string("id");
    t.nonNull.string("name");
  },
});

export const UpdateDocumentNameResult = objectType({
  name: "UpdateDocumentNameResult",
  definition(t) {
    t.field("document", { type: Document });
  },
});

export const updateDocumentNameMutation = mutationField("updateDocumentName", {
  type: UpdateDocumentNameResult,
  args: {
    input: arg({
      type: UpdateDocumentNameInput,
    }),
  },
  async resolve(root, args, context) {
    if (!args.input) {
      throw new UserInputError("Invalid input");
    }
    if (!args.input.id) {
      throw new UserInputError("Invalid input: id cannot be null");
    }
    if (!args.input.name) {
      throw new UserInputError("Invalid input: name cannot be null");
    }
    if (!context.user) {
      throw new AuthenticationError("Not authenticated");
    }
    const document = await updateDocumentName({
      id: args.input.id,
      name: args.input.name,
      userId: context.user.id,
    });
    return { document };
  },
});
