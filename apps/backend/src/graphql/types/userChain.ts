import { objectType } from "nexus";

export const UserChainEvent = objectType({
  name: "UserChainEvent",
  definition(t) {
    t.nonNull.string("serializedContent");
    t.nonNull.int("position");
  },
});
