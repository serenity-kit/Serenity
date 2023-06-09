import { prisma } from "../prisma";

type Cursor = {
  id?: string;
};

type Params = {
  cursor?: Cursor;
  skip?: number;
  take: number;
  invitationId: string;
};
export async function getWorkspaceChainByInvitationId({
  invitationId,
}: // cursor,
// skip,
// take,
Params) {
  const invitation = await prisma.workspaceInvitations.findFirstOrThrow({
    where: { id: invitationId, expiresAt: { gte: new Date() } },
    select: { workspaceId: true },
  });
  const workspaceChain = await prisma.workspaceChainEvent.findMany({
    where: {
      workspaceId: invitation.workspaceId,
    },
    // cursor,
    // skip,
    // take,
    orderBy: {
      position: "asc",
    },
    select: {
      position: true,
      content: true,
    },
  });
  return workspaceChain.map((workspaceChainEvent) => {
    return {
      ...workspaceChainEvent,
      serializedContent: JSON.stringify(workspaceChainEvent.content),
    };
  });
}
