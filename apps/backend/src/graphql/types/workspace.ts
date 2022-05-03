import { objectType } from "nexus";

export const Workspace = objectType({
  name: "Workspace",
  definition(t) {
    t.nonNull.string("id");
    t.string("name");
  },
});
