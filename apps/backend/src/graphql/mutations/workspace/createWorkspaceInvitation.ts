import { AuthenticationError, UserInputError } from "apollo-server-express";
import {
  arg,
  inputObjectType,
  mutationField,
  nonNull,
  objectType,
} from "nexus";
import { Role } from "../../../../prisma/generated/output";
import { createWorkspaceInvitation } from "../../../database/workspace/createWorkspaceInvitation";
import { formatWorkspaceInvitation } from "../../../types/workspace";
import { MemberRoleEnum, WorkspaceInvitation } from "../../types/workspace";

const getRoleFromString = (role: string): Role | undefined => {
  const lowercaseRole = role.toLowerCase();
  if (lowercaseRole === "admin") {
    return Role.ADMIN;
  } else if (lowercaseRole === "editor") {
    return Role.EDITOR;
  } else if (lowercaseRole === "commenter") {
    return Role.COMMENTER;
  } else if (lowercaseRole === "viewer") {
    return Role.VIEWER;
  } else {
    return undefined;
  }
};

export const CreateWorkspaceInvitationInput = inputObjectType({
  name: "CreateWorkspaceInvitationInput",
  definition(t) {
    t.nonNull.string("workspaceId");
    t.nonNull.string("invitationId");
    t.nonNull.string("invitationSigningPublicKey");
    t.nonNull.string("invitationDataSignature");
    t.nonNull.field("role", { type: MemberRoleEnum });
    t.nonNull.field("expiresAt", { type: "Date" });
  },
});

export const CreateWorkspaceInvitationResult = objectType({
  name: "CreateWorkspaceInvitationResult",
  definition(t) {
    t.field("workspaceInvitation", { type: WorkspaceInvitation });
  },
});

export const createWorkspaceInvitationMutation = mutationField(
  "createWorkspaceInvitation",
  {
    type: CreateWorkspaceInvitationResult,
    args: {
      input: nonNull(
        arg({
          type: CreateWorkspaceInvitationInput,
        })
      ),
    },
    async resolve(root, args, context) {
      console.log({ args });
      if (!context.user) {
        throw new AuthenticationError("Not authenticated");
      }
      const role = getRoleFromString(args.input.role);
      if (!role) {
        throw new UserInputError("Invalid sharing role");
      }
      const workspaceInvitation = await createWorkspaceInvitation({
        workspaceId: args.input.workspaceId,
        invitationId: args.input.invitationId,
        invitationSigningPublicKey: args.input.invitationSigningPublicKey,
        expiresAt: args.input.expiresAt,
        invitationDataSignature: args.input.invitationDataSignature,
        role,
        inviterUserId: context.user.id,
      });
      return {
        workspaceInvitation: formatWorkspaceInvitation(workspaceInvitation),
      };
    },
  }
);
