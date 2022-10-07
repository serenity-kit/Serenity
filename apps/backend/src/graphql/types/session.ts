import { objectType } from "nexus";

export const Session = objectType({
  name: "Session",
  definition(t) {
    t.nonNull.field("expiresAt", { type: "Date" });
  },
});
