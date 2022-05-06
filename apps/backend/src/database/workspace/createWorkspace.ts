import { prisma } from "../prisma";

type Params = {
  id: string;
  name: string;
  username: string;
};

export async function createWorkspace({ id, name, username }: Params) {
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
  const workspace: any = {};
  workspace.id = rawWorkspace.id;
  workspace.name = rawWorkspace.name;
  workspace.idSignature = rawWorkspace.idSignature;
  workspace.members = usersToWorkspaces;
  return workspace;
}
