import { objectType } from "nexus";

export const DocumentChainEvent = objectType({
  name: "DocumentChainEvent",
  definition(t) {
    t.nonNull.string("serializedContent");
    t.nonNull.int("position");
  },
});
