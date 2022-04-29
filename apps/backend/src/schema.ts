import { makeSchema, connectionPlugin } from "nexus";
import path from "path";
import * as InitializeRegistrationTypes from "./graphql/mutations/initializeRegistration";
import * as FinalizeRegistrationTypes from "./graphql/mutations/finalizeRegistration";
import * as InitializeLoginTypes from "./graphql/mutations/initializeLogin";
import * as FinalizeLoginTypes from "./graphql/mutations/finalizeLogin";
import * as InitializePasswordResetTypes from "./graphql/mutations/initializePasswordReset";
import * as FinalizePasswordResetTypes from "./graphql/mutations/finalizePasswordReset";
import * as DocumentPreviewsQueryTypes from "./graphql/queries/documentPreviews";
import * as CreateDocumentMutationTypes from "./graphql/mutations/createDocument";
import * as DocumentTypes from "./graphql/types/documentPreview";

export const schema = makeSchema({
  plugins: [
    connectionPlugin({
      includeNodesField: true,
    }),
  ],
  types: [
    DocumentTypes,
    DocumentPreviewsQueryTypes,
    CreateDocumentMutationTypes,
    InitializeRegistrationTypes,
    FinalizeRegistrationTypes,
    InitializeLoginTypes,
    FinalizeLoginTypes,
    InitializePasswordResetTypes,
    FinalizePasswordResetTypes,
  ],
  outputs: {
    schema: path.join(__dirname, "/generated/schema.graphql"),
    typegen: path.join(__dirname, "/generated/typings.ts"),
  },
});
