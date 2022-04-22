import { makeSchema, connectionPlugin } from "nexus";
import path from "path";
import * as QueryTypes from "./graphql/Query";
import * as MutationTypes from "./graphql/Mutation";
import * as DocumentsQueryTypes from "./graphql/queries/documents";
import * as CreateDocumentMutationTypes from "./graphql/mutations/createDocument";
import * as DocumentTypes from "./graphql/types/document";

export const schema = makeSchema({
  plugins: [
    connectionPlugin({
      includeNodesField: true,
    }),
  ],
  types: [
    DocumentTypes,
    QueryTypes,
    DocumentsQueryTypes,
    MutationTypes,
    CreateDocumentMutationTypes,
  ],
  outputs: {
    schema: path.join(__dirname, "/generated/schema.graphql"),
    typegen: path.join(__dirname, "/generated/typings.ts"),
  },
});
