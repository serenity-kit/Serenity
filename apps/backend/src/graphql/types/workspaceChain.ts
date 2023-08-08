import { objectType } from "nexus";

export const WorkspaceChainEvent = objectType({
  name: "WorkspaceChainEvent",
  definition(t) {
    t.nonNull.string("serializedContent");
    t.nonNull.string("position"); // TODO should be an int?!?
  },
});
