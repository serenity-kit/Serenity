import { objectType } from "nexus";
import { UserChainEvent } from "./userChain";

export const User = objectType({
  name: "User",
  definition(t) {
    t.nonNull.string("id");
    t.nonNull.string("username");
    t.nonNull.list.nonNull.field("chain", { type: UserChainEvent });
  },
});
