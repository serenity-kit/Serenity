-- CreateTable
CREATE TABLE "Document" (
    "id" TEXT NOT NULL,
    "activeSnapshotId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "workspaceId" TEXT NOT NULL,
    "parentFolderId" TEXT,
    "name" TEXT NOT NULL,

    CONSTRAINT "Document_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Snapshot" (
    "id" TEXT NOT NULL,
    "latestVersion" INTEGER NOT NULL,
    "data" TEXT NOT NULL,
    "preview" TEXT NOT NULL,
    "documentId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "clocks" JSONB NOT NULL,

    CONSTRAINT "Snapshot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Update" (
    "id" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "data" TEXT NOT NULL,
    "snapshotId" TEXT NOT NULL,
    "snapshotVersion" INTEGER NOT NULL,
    "pubKey" TEXT NOT NULL,

    CONSTRAINT "Update_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Registration" (
    "username" TEXT NOT NULL,
    "serverPrivateKey" TEXT NOT NULL,
    "serverPublicKey" TEXT NOT NULL DEFAULT E'invalid',
    "oprfPrivateKey" TEXT NOT NULL,
    "oprfPublicKey" TEXT NOT NULL DEFAULT E'invalid',

    CONSTRAINT "Registration_pkey" PRIMARY KEY ("username")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "serverPrivateKey" TEXT NOT NULL,
    "serverPublicKey" TEXT NOT NULL DEFAULT E'invalid',
    "oprfPrivateKey" TEXT NOT NULL,
    "oprfPublicKey" TEXT NOT NULL DEFAULT E'invalid',
    "oprfCipherText" TEXT NOT NULL,
    "oprfNonce" TEXT NOT NULL,
    "clientPublicKey" TEXT NOT NULL,
    "sharedRx" TEXT,
    "sharedTx" TEXT,
    "resetPasswordToken" TEXT,
    "masterDeviceCiphertext" TEXT NOT NULL,
    "masterDeviceNonce" TEXT NOT NULL,
    "masterDeviceSigningPublicKey" TEXT NOT NULL,
    "passwordResetOneTimePassword" TEXT,
    "passwordResetOneTimePasswordExpireDateTime" TIMESTAMP(3),

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserLoginAccessToken" (
    "accessToken" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3),
    "userId" TEXT NOT NULL,

    CONSTRAINT "UserLoginAccessToken_pkey" PRIMARY KEY ("accessToken")
);

-- CreateTable
CREATE TABLE "RecoveryDevice" (
    "ciphertext" TEXT NOT NULL,
    "nonce" TEXT NOT NULL,
    "deviceSigningPublicKey" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "signatureForMasterDeviceSigningPublicKey" TEXT NOT NULL,
    "signatureForRecoveryDeviceSigningPublicKey" TEXT NOT NULL,

    CONSTRAINT "RecoveryDevice_pkey" PRIMARY KEY ("deviceSigningPublicKey")
);

-- CreateTable
CREATE TABLE "Device" (
    "signingPublicKey" TEXT NOT NULL,
    "encryptionPublicKey" TEXT NOT NULL,
    "encryptionPublicKeySignature" TEXT NOT NULL,
    "userId" TEXT,

    CONSTRAINT "Device_pkey" PRIMARY KEY ("signingPublicKey")
);

-- CreateTable
CREATE TABLE "Workspace" (
    "id" TEXT NOT NULL,
    "idSignature" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Workspace_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UsersToWorkspaces" (
    "userId" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "isAdmin" BOOLEAN NOT NULL,

    CONSTRAINT "UsersToWorkspaces_pkey" PRIMARY KEY ("userId","workspaceId")
);

-- CreateTable
CREATE TABLE "Folder" (
    "id" TEXT NOT NULL,
    "idSignature" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "parentFolderId" TEXT,
    "rootFolderId" TEXT,

    CONSTRAINT "Folder_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Document_activeSnapshotId_key" ON "Document"("activeSnapshotId");

-- CreateIndex
CREATE UNIQUE INDEX "Update_snapshotId_version_key" ON "Update"("snapshotId", "version");

-- CreateIndex
CREATE UNIQUE INDEX "Update_snapshotId_pubKey_snapshotVersion_key" ON "Update"("snapshotId", "pubKey", "snapshotVersion");

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "User_masterDeviceSigningPublicKey_key" ON "User"("masterDeviceSigningPublicKey");

-- CreateIndex
CREATE UNIQUE INDEX "UserLoginAccessToken_accessToken_key" ON "UserLoginAccessToken"("accessToken");

-- CreateIndex
CREATE UNIQUE INDEX "RecoveryDevice_userId_key" ON "RecoveryDevice"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Device_signingPublicKey_key" ON "Device"("signingPublicKey");

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_activeSnapshotId_fkey" FOREIGN KEY ("activeSnapshotId") REFERENCES "Snapshot"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_parentFolderId_fkey" FOREIGN KEY ("parentFolderId") REFERENCES "Folder"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Snapshot" ADD CONSTRAINT "Snapshot_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "Document"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Update" ADD CONSTRAINT "Update_snapshotId_fkey" FOREIGN KEY ("snapshotId") REFERENCES "Snapshot"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_masterDeviceSigningPublicKey_fkey" FOREIGN KEY ("masterDeviceSigningPublicKey") REFERENCES "Device"("signingPublicKey") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserLoginAccessToken" ADD CONSTRAINT "UserLoginAccessToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecoveryDevice" ADD CONSTRAINT "RecoveryDevice_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecoveryDevice" ADD CONSTRAINT "RecoveryDevice_deviceSigningPublicKey_fkey" FOREIGN KEY ("deviceSigningPublicKey") REFERENCES "Device"("signingPublicKey") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Device" ADD CONSTRAINT "Device_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UsersToWorkspaces" ADD CONSTRAINT "UsersToWorkspaces_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UsersToWorkspaces" ADD CONSTRAINT "UsersToWorkspaces_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Folder" ADD CONSTRAINT "Folder_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Folder" ADD CONSTRAINT "Folder_parentFolderId_fkey" FOREIGN KEY ("parentFolderId") REFERENCES "Folder"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Folder" ADD CONSTRAINT "Folder_rootFolderId_fkey" FOREIGN KEY ("rootFolderId") REFERENCES "Folder"("id") ON DELETE CASCADE ON UPDATE CASCADE;
