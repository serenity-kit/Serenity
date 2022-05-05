import { inputObjectType, list, objectType } from "nexus";

export const Workspace = objectType({
  name: "Workspace",
  definition(t) {
    t.nonNull.string("id");
    t.string("name");
  },
});

export const WorkspaceSharingInput = inputObjectType({
  name: "WorkspaceSharingInput",
  definition(t) {
    t.nonNull.string("username");
    t.nonNull.boolean("isAdmin");
  },
});

export const WorkspaceInput = inputObjectType({
  name: "WorkspaceInput",
  definition(t) {
    t.nonNull.string("id");
    t.nonNull.string("name");
    t.field("sharing", {
      type: list(WorkspaceSharingInput),
    });
  },
});
