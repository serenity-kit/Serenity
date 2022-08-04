-- CreateTable
CREATE TABLE "WorkspaceKey" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,

    CONSTRAINT "WorkspaceKey_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkspaceKeyBox" (
    "id" TEXT NOT NULL,
    "workspaceKeyId" TEXT NOT NULL,
    "deviceSigningPublicKey" TEXT NOT NULL,
    "cipherText" TEXT NOT NULL,

    CONSTRAINT "WorkspaceKeyBox_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "WorkspaceKey_id_key" ON "WorkspaceKey"("id");

-- CreateIndex
CREATE UNIQUE INDEX "WorkspaceKeyBox_id_key" ON "WorkspaceKeyBox"("id");

-- AddForeignKey
ALTER TABLE "WorkspaceKey" ADD CONSTRAINT "WorkspaceKey_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkspaceKeyBox" ADD CONSTRAINT "WorkspaceKeyBox_workspaceKeyId_fkey" FOREIGN KEY ("workspaceKeyId") REFERENCES "WorkspaceKey"("id") ON DELETE CASCADE ON UPDATE CASCADE;
