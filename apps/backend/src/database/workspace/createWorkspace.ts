import { prisma } from "../prisma";
import { Workspace } from "../../types/workspace";

type Params = {
  id: string;
  name: string;
  username: string;
};

export async function createWorkspace({
  id,
  name,
  username,
}: Params): Promise<Workspace> {
  const rawWorkspace = await prisma.workspace.create({
    data: {
      id,
      idSignature: "TODO",
      name,
      usersToWorkspaces: {
        create: {
          username: username,
          isAdmin: true,
        },
      },
    },
  });
  const usersToWorkspaces = await prisma.usersToWorkspaces.findMany({
    where: {
      workspaceId: rawWorkspace.id,
      username,
    },
  });
  const workspace: Workspace = {
    id: rawWorkspace.id,
    name: rawWorkspace.name,
    idSignature: rawWorkspace.idSignature,
    members: usersToWorkspaces,
  };
  return workspace;
}
