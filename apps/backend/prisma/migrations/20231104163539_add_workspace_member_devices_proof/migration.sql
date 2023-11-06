-- CreateTable
CREATE TABLE "WorkspaceMemberDevicesProof" (
    "hash" TEXT NOT NULL,
    "proof" JSONB NOT NULL,
    "data" JSONB NOT NULL,
    "clock" INTEGER NOT NULL,
    "workspaceId" TEXT NOT NULL,

    CONSTRAINT "WorkspaceMemberDevicesProof_pkey" PRIMARY KEY ("workspaceId","clock")
);

-- CreateIndex
CREATE UNIQUE INDEX "WorkspaceMemberDevicesProof_hash_key" ON "WorkspaceMemberDevicesProof"("hash");

-- CreateIndex
CREATE INDEX "WorkspaceMemberDevicesProof_workspaceId_clock_idx" ON "WorkspaceMemberDevicesProof"("workspaceId", "clock" ASC);

-- AddForeignKey
ALTER TABLE "WorkspaceMemberDevicesProof" ADD CONSTRAINT "WorkspaceMemberDevicesProof_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;
