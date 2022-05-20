import { idArg, list, queryField, objectType } from "nexus";

export const MeResult = objectType({
  name: "MeResult",
  definition(t) {
    t.string("username");
  },
});

// return string type
export const folders = queryField((t) => {
  t.field("me", {
    type: MeResult,
    args: null,
    async resolve(root, args, context) {
      if (!context.user) {
        throw new Error("Unauthorized");
      }
      const username = context.user.username;
      return { username };
    },
  });
});
