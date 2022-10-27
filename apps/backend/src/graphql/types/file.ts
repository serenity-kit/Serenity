import { objectType } from "nexus";

export const File = objectType({
  name: "File",
  definition(t) {
    t.nonNull.string("id");
    t.nonNull.string("downloadUrl");
  },
});
