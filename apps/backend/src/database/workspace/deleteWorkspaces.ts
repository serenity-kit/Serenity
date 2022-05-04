import { prisma } from "../prisma";

type Params = {
  workspaceIds: string[];
  username: string;
};

export async function deleteWorkspaces({ workspaceIds, username }: Params) {
  try {
    // await prisma.$transaction(async (prisma) => {
    console.log({ workspaceIds });
    // TODO: delete usersToWorkspace?
    // can only delete workspaces where the user is the admin
    const userWorkspaces = await prisma.usersToWorkspaces.findMany({
      where: {
        username: username,
        isAdmin: true,
        workspaceId: {
          in: workspaceIds,
        },
      },
    });
    console.log({ userWorkspaces });
    let userWorkspaceIds: string[] = [];
    for (const userWorkspace of userWorkspaces) {
      userWorkspaceIds.push(userWorkspace.workspaceId);
    }
    console.log({ userWorkspaceIds });
    await prisma.workspace.deleteMany({
      where: {
        id: {
          in: userWorkspaceIds,
        },
      },
    });
    // });
  } catch (error) {
    console.log("ERROR deleteing workspaces");
    console.log(error);
    throw Error("Invalid workspace IDs");
  }
}
