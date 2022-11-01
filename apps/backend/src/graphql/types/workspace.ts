import { enumType, inputObjectType, list, nonNull, objectType } from "nexus";
import { CreatorDevice, Device } from "./device";

export const MemberIdWithDevice = objectType({
  name: "WorkspaceIdWithDevices",
  definition(t) {
    t.nonNull.string("id");
    t.nonNull.list.nonNull.field("devices", { type: Device });
  },
});

export const WorkspaceIdWithMemberDevices = objectType({
  name: "WorkspaceIdWithMemberDevices",
  definition(t) {
    t.nonNull.string("id");
    t.nonNull.list.nonNull.field("members", { type: MemberIdWithDevice });
  },
});

export const WorkspaceKeyBox = objectType({
  name: "WorkspaceKeyBox",
  definition(t) {
    t.nonNull.string("id");
    t.nonNull.string("workspaceKeyId");
    t.nonNull.string("deviceSigningPublicKey");
    t.nonNull.string("creatorDeviceSigningPublicKey");
    t.nonNull.string("nonce");
    t.nonNull.string("ciphertext");
    t.field("creatorDevice", { type: CreatorDevice });
  },
});

export const WorkspaceKey = objectType({
  name: "WorkspaceKey",
  definition(t) {
    t.nonNull.string("id");
    t.nonNull.string("workspaceId");
    t.nonNull.int("generation");
    t.field("workspaceKeyBox", {
      type: WorkspaceKeyBox,
    });
    t.list.nonNull.field("workspaceKeyBoxes", {
      type: WorkspaceKeyBox,
    });
  },
});

const RoleEnum = enumType({
  name: "Role",
  members: {
    ADMIN: "ADMIN",
    EDITOR: "EDITOR",
    COMMENTER: "COMMENTER",
    VIEWER: "VIEWER",
  },
});

export const WorkspaceMember = objectType({
  name: "WorkspaceMember",
  definition(t) {
    t.nonNull.string("userId");
    t.string("username");
    t.nonNull.field("role", { type: RoleEnum });
  },
});

export const Workspace = objectType({
  name: "Workspace",
  definition(t) {
    t.nonNull.string("id");
    t.string("name");
    t.string("idSignature");
    t.list.nonNull.field("members", { type: WorkspaceMember });
    t.list.nonNull.field("workspaceKeys", { type: WorkspaceKey });
    t.field("currentWorkspaceKey", { type: WorkspaceKey });
  },
});

export const WorkspaceLoadingInfo = objectType({
  name: "WorkspaceLoadingInfo",
  definition(t) {
    t.nonNull.string("id");
    t.nonNull.boolean("isAuthorized");
    t.string("documentId");
  },
});

export const WorkspaceMemberInput = inputObjectType({
  name: "WorkspaceMemberInput",
  definition(t) {
    t.nonNull.string("userId");
    t.nonNull.string("role");
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

export const WorkspaceInvitation = objectType({
  name: "WorkspaceInvitation",
  definition(t) {
    t.nonNull.string("id");
    t.nonNull.string("workspaceId");
    t.nonNull.string("inviterUserId");
    t.nonNull.string("inviterUsername");
    t.string("workspaceName");
    t.field("expiresAt", { type: nonNull("Date") });
  },
});
