import { prisma } from "../prisma";
import { registerUser } from "./../../../test/helpers/registerUser";
import setupGraphql from "../../../test/helpers/setupGraphql";

type Params = {
  id: string;
  username: string;
};

export default async function createUserWithWorkspace({
  id,
  username,
}: Params) {
  const graphql = setupGraphql();
  const registerUserResponse = await registerUser(
    graphql,
    username,
    "password"
  );
  const user = await prisma.user.findFirst({
    where: {
      username,
    },
  });
  if (!user) {
    throw new Error("User not found");
  }
  await prisma.workspace.create({
    data: {
      id,
      name: "My Workspace",
      idSignature: "TODO",
      usersToWorkspaces: {
        create: {
          userId: user.id,
          isAdmin: true,
        },
      },
    },
  });
  return user;
}
