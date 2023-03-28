-- CreateTable
CREATE TABLE "WorkspaceChainEntry" (
    "id" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    "content" JSONB NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WorkspaceChainEntry_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "WorkspaceChainEntry_id_key" ON "WorkspaceChainEntry"("id");

-- CreateIndex
CREATE INDEX "WorkspaceChainEntry_workspaceId_position_idx" ON "WorkspaceChainEntry"("workspaceId", "position" ASC);

-- AddForeignKey
ALTER TABLE "WorkspaceChainEntry" ADD CONSTRAINT "WorkspaceChainEntry_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;
