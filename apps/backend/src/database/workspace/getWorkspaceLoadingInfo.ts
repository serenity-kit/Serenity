import { UsersToWorkspaces, Workspace } from "../../../prisma/generated/output";
import { prisma } from "../prisma";

type Params = {
  workspaceId: string | undefined;
  documentId: string | undefined;
  userId: string;
  returnOtherWorkspaceIfNotFound: boolean;
  returnOtherDocumentIfNotFound: boolean;
};

const getFirstWorkspace = async ({ userId }: { userId: string }) => {
  const usersToWorkspace = await prisma.usersToWorkspaces.findMany({
    where: { userId },
    include: {
      workspace: true,
    },
  });
  if (!usersToWorkspace.length) {
    // TODO: handle case where user has no workspaces
    return null;
  }
  const workspaceIds: string[] = [];
  const workspaceLookup: { [workspaceId: string]: UsersToWorkspaces } = {};
  usersToWorkspace.forEach((usersToWorkspace) => {
    workspaceIds.push(usersToWorkspace.workspaceId);
    workspaceLookup[usersToWorkspace.workspaceId] = usersToWorkspace;
  });
  const userDocument = await prisma.document.findFirst({
    where: { workspaceId: { in: workspaceIds } },
    orderBy: { createdAt: "desc" },
    select: { id: true, workspaceId: true, workspace: true },
  });
  if (!userDocument) {
    const workspace = usersToWorkspace[0].workspace;
    return {
      ...workspace,
      usersToWorkspaces: [
        {
          ...usersToWorkspace[0],
        },
      ],
      documents: [],
    };
  }
  const workspaceMembership = workspaceLookup[userDocument.workspaceId];
  return {
    ...userDocument.workspace,
    usersToWorkspaces: [workspaceMembership],
    documents: [userDocument],
  };
};

const getWorkspaceByWorkspaceId = async ({
  userId,
  workspaceId,
}: {
  userId: string;
  workspaceId: string;
}) => {
  return await prisma.workspace.findFirst({
    include: {
      usersToWorkspaces: { where: { userId } },
      documents: {
        take: 1,
        orderBy: { createdAt: "desc" },
        select: { id: true },
      },
    },
    where: {
      id: workspaceId,
      usersToWorkspaces: { some: { userId } },
    },
  });
};

const getWorkspaceByWorkspaceIdAndDocumentId = async ({
  userId,
  workspaceId,
  documentId,
}: {
  userId: string;
  workspaceId: string;
  documentId: string;
}) => {
  return await prisma.workspace.findFirst({
    include: {
      usersToWorkspaces: { where: { userId } },
      documents: {
        take: 1,
        orderBy: { createdAt: "desc" },
        where: { id: documentId },
        select: { id: true },
      },
    },
    where: {
      id: workspaceId,
      usersToWorkspaces: { some: { userId } },
    },
  });
};

const getFirstDocumentIdByWorkspaceId = async ({
  workspaceId,
}: {
  workspaceId: string;
}) => {
  const document = await prisma.document.findFirst({
    orderBy: { createdAt: "desc" },
    where: { workspaceId },
    select: { id: true },
  });
  return document?.id || null;
};

export async function getWorkspaceLoadingInfo({
  userId,
  workspaceId,
  documentId,
  returnOtherWorkspaceIfNotFound,
  returnOtherDocumentIfNotFound,
}: Params) {
  let workspace:
    | (Workspace & {
        usersToWorkspaces: UsersToWorkspaces[];
        documents: { id: string }[];
      })
    | null = null;

  if (!workspaceId && documentId) {
    throw new Error(
      "Invalid input: documentId can't be set without workspaceId"
    );
  } else if (!workspaceId && !documentId) {
    // here we can return early because returnOther cases will not take effect
    return await getFirstWorkspace({ userId });
  } else if (workspaceId && !documentId) {
    workspace = await getWorkspaceByWorkspaceId({ userId, workspaceId });
  } else if (workspaceId && documentId) {
    workspace = await getWorkspaceByWorkspaceIdAndDocumentId({
      userId,
      workspaceId,
      documentId,
    });
  }
  if (workspace && workspace.documents.length === 0) {
    if (returnOtherDocumentIfNotFound) {
      const documentId = await getFirstDocumentIdByWorkspaceId({
        workspaceId: workspace.id,
      });
      return {
        ...workspace,
        documents: [{ id: documentId }],
      };
    }
  }
  if (!workspace && returnOtherWorkspaceIfNotFound) {
    return await getFirstWorkspace({ userId });
  }

  return workspace;
}
