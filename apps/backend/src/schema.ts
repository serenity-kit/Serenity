import { makeSchema } from "nexus";
import path from "path";
import * as QueryTypes from "./graphql/Query";
import * as MutationTypes from "./graphql/Mutation";

export const schema = makeSchema({
  plugins: [],
  types: [QueryTypes, MutationTypes],
  outputs: {
    schema: path.join(__dirname, "/generated/schema.graphql"),
    typegen: path.join(__dirname, "/generated/typings.ts"),
  },
});
