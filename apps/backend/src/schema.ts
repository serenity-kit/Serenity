import { makeSchema, connectionPlugin } from "nexus";
import path from "path";
import * as QueryTypes from "./graphql/Query";
import * as MutationTypes from "./graphql/Mutation";
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
    QueryTypes,
    DocumentPreviewsQueryTypes,
    MutationTypes,
    CreateDocumentMutationTypes,
  ],
  outputs: {
    schema: path.join(__dirname, "/generated/schema.graphql"),
    typegen: path.join(__dirname, "/generated/typings.ts"),
  },
});
