import { queryField } from "nexus";

export const test = queryField("test", {
  type: "String",
  resolve(root, args, context) {
    return "hello";
  },
});
