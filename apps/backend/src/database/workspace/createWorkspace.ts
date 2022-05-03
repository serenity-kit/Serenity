import { prisma } from "../prisma";

type Params = {
  id: string;
  name: string;
  username: string;
};

export async function createWorkspace({ id, name, username }: Params) {
  return await prisma.workspace.create({
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
}
