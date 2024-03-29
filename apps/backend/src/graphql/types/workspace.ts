import { enumType, nonNull, objectType } from "nexus";
import { CreatorDevice } from "./device";
import { User } from "./user";

export const WorkspaceKeyBox = objectType({
  name: "WorkspaceKeyBox",
  definition(t) {
    t.nonNull.string("id");
    t.nonNull.string("workspaceKeyId");
    t.nonNull.string("deviceSigningPublicKey");
    t.nonNull.string("creatorDeviceSigningPublicKey");
    t.nonNull.string("nonce");
    t.nonNull.string("ciphertext");
    t.nonNull.field("creatorDevice", { type: CreatorDevice });
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

export const MemberRoleEnum = enumType({
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
    t.nonNull.string("id"); // workspaceId + userId
    t.nonNull.field("user", { type: User });
  },
});

export const Workspace = objectType({
  name: "Workspace",
  definition(t) {
    t.nonNull.string("id");
    t.string("infoCiphertext");
    t.string("infoNonce");
    t.nonNull.string("infoSignature");
    t.nonNull.string("infoWorkspaceMemberDevicesProofHash");
    t.nonNull.string("infoCreatorDeviceSigningPublicKey");
    t.string("infoWorkspaceKeyId");
    t.field("infoWorkspaceKey", { type: WorkspaceKey });
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

export const WorkspaceInvitation = objectType({
  name: "WorkspaceInvitation",
  definition(t) {
    t.nonNull.string("id");
    t.nonNull.string("workspaceId");
    t.nonNull.string("inviterUserId");
    t.nonNull.string("inviterUsername");
    t.nonNull.string("invitationDataSignature");
    t.nonNull.string("invitationSigningPublicKey");
    t.nonNull.field("role", { type: MemberRoleEnum });
    t.string("workspaceName");
    t.field("expiresAt", { type: nonNull("Date") });
  },
});
