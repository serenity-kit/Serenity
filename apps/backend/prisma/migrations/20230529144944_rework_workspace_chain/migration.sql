/*
  Warnings:

  - You are about to drop the `WorkspaceChainEntry` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "WorkspaceChainEntry" DROP CONSTRAINT "WorkspaceChainEntry_workspaceId_fkey";

-- DropTable
DROP TABLE "WorkspaceChainEntry";

-- CreateTable
CREATE TABLE "WorkspaceChainEvent" (
    "position" INTEGER NOT NULL,
    "content" JSONB NOT NULL,
    "state" JSONB NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WorkspaceChainEvent_pkey" PRIMARY KEY ("workspaceId","position")
);

-- CreateIndex
CREATE INDEX "WorkspaceChainEvent_workspaceId_position_idx" ON "WorkspaceChainEvent"("workspaceId", "position" ASC);

-- AddForeignKey
ALTER TABLE "WorkspaceChainEvent" ADD CONSTRAINT "WorkspaceChainEvent_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;
