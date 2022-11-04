import { objectType } from "nexus";

export const DocumentShareLink = objectType({
  name: "DocumentShareLink",
  definition(t) {
    t.nonNull.string("token");
  },
});
