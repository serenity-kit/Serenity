// @ts-ignore
import { AuthenticationError } from "apollo-server-express";
import {
  arg,
  inputObjectType,
  mutationField,
  nonNull,
  objectType,
} from "nexus";
import { initiateFileUpload } from "../../../database/file/initiateFileUpload";

export const InitiateFileUploadInput = inputObjectType({
  name: "InitiateFileUploadInput",
  definition(t) {
    t.nonNull.string("workspaceId");
    t.nonNull.string("documentId");
  },
});

export const InitiateFileUploadResult = objectType({
  name: "InitiateFileUploadResult",
  definition(t) {
    t.nonNull.string("uploadUrl");
    t.nonNull.string("fileId");
  },
});

export const initiateFileUploadMutation = mutationField("initiateFileUpload", {
  type: InitiateFileUploadResult,
  args: {
    input: nonNull(
      arg({
        type: InitiateFileUploadInput,
      })
    ),
  },
  async resolve(root, args, context) {
    if (!context.user) {
      throw new AuthenticationError("Not authenticated");
    }
    const response = await initiateFileUpload({
      userId: context.user.id,
      documentId: args.input.documentId,
      workspaceId: args.input.workspaceId,
    });
    return response;
  },
});
