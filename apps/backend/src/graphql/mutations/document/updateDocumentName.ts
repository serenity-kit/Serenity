import { arg, inputObjectType, mutationField, objectType } from "nexus";
import { updateDocumentName } from "../../../database/document/updateDocumentName";
import { DocumentPreview } from "../../types/documentPreview";

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
    t.field("document", { type: DocumentPreview });
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
    if (!context.user) {
      throw new Error("Unauthorized");
    }
    if (!args.input) {
      throw new Error("Invalid input");
    }
    const document = await updateDocumentName({
      id: args.input.id,
      name: args.input.name,
      username: context.user.username,
    });
    return { document };
  },
});
