import { inputObjectType, list, objectType } from "nexus";

export const WorkspacePermissionsOutput = objectType({
  name: "WorkspacePermissionsOutput",
  definition(t) {
    t.nonNull.string("username");
    t.nonNull.boolean("isAdmin");
  },
});

export const Workspace = objectType({
  name: "Workspace",
  definition(t) {
    t.nonNull.string("id");
    t.string("name");
    t.list.nonNull.field("members", {
      type: WorkspacePermissionsOutput,
    });
  },
});

export const WorkspaceMemberInput = inputObjectType({
  name: "WorkspaceMemberInput",
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
      type: list(WorkspaceMemberInput),
    });
  },
});
