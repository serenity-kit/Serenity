-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'EDITOR', 'COMMENTER', 'VIEWER');

-- CreateTable
CREATE TABLE "Document" (
    "id" TEXT NOT NULL,
    "activeSnapshotId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "workspaceId" TEXT NOT NULL,
    "workspaceKeyId" TEXT,
    "parentFolderId" TEXT NOT NULL,
    "encryptedName" TEXT,
    "encryptedNameNonce" TEXT,
    "subkeyId" INTEGER,
    "nameKeyDerivationTrace" JSONB NOT NULL DEFAULT '{}',
    "requiresSnapshot" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Document_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Snapshot" (
    "id" TEXT NOT NULL,
    "latestVersion" INTEGER NOT NULL,
    "data" TEXT NOT NULL,
    "documentId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "keyDerivationTrace" JSONB NOT NULL DEFAULT '{}',
    "clocks" JSONB NOT NULL,
    "subkeyId" INTEGER NOT NULL,

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
CREATE TABLE "UnverifiedUser" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "opaqueEnvelope" TEXT NOT NULL,
    "confirmationCode" TEXT NOT NULL,
    "confirmationTryCounter" INTEGER NOT NULL DEFAULT 0,
    "mainDeviceNonce" TEXT NOT NULL,
    "mainDeviceCiphertext" TEXT NOT NULL,
    "mainDeviceEncryptionKeySalt" TEXT NOT NULL,
    "mainDeviceSigningPublicKey" TEXT NOT NULL,
    "mainDeviceEncryptionPublicKey" TEXT NOT NULL,
    "mainDeviceEncryptionPublicKeySignature" TEXT NOT NULL,
    "pendingWorkspaceInvitationId" TEXT,
    "pendingWorkspaceInvitationKeySubkeyId" INTEGER,
    "pendingWorkspaceInvitationKeyCiphertext" TEXT,
    "pendingWorkspaceInvitationKeyPublicNonce" TEXT,
    "pendingWorkspaceInvitationKeyEncryptionSalt" TEXT,

    CONSTRAINT "UnverifiedUser_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "opaqueEnvelope" TEXT NOT NULL,
    "mainDeviceCiphertext" TEXT NOT NULL,
    "mainDeviceNonce" TEXT NOT NULL,
    "mainDeviceEncryptionKeySalt" TEXT NOT NULL,
    "mainDeviceSigningPublicKey" TEXT NOT NULL,
    "pendingWorkspaceInvitationId" TEXT,
    "pendingWorkspaceInvitationKeySubkeyId" INTEGER,
    "pendingWorkspaceInvitationKeyCiphertext" TEXT,
    "pendingWorkspaceInvitationKeyPublicNonce" TEXT,
    "pendingWorkspaceInvitationKeyEncryptionSalt" TEXT,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "sessionKey" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    "deviceSigningPublicKey" TEXT NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("sessionKey")
);

-- CreateTable
CREATE TABLE "WorkspaceInvitations" (
    "id" TEXT NOT NULL,
    "inviterUserId" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "invitationSigningPublicKey" TEXT NOT NULL,
    "invitationDataSignature" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WorkspaceInvitations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RecoveryDevice" (
    "ciphertext" TEXT NOT NULL,
    "nonce" TEXT NOT NULL,
    "deviceSigningPublicKey" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "signatureForMainDeviceSigningPublicKey" TEXT NOT NULL,
    "signatureForRecoveryDeviceSigningPublicKey" TEXT NOT NULL,

    CONSTRAINT "RecoveryDevice_pkey" PRIMARY KEY ("deviceSigningPublicKey")
);

-- CreateTable
CREATE TABLE "Device" (
    "signingPublicKey" TEXT NOT NULL,
    "encryptionPublicKey" TEXT NOT NULL,
    "encryptionPublicKeySignature" TEXT NOT NULL,
    "userId" TEXT,
    "info" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Device_pkey" PRIMARY KEY ("signingPublicKey")
);

-- CreateTable
CREATE TABLE "CreatorDevice" (
    "signingPublicKey" TEXT NOT NULL,
    "encryptionPublicKey" TEXT NOT NULL,
    "encryptionPublicKeySignature" TEXT NOT NULL,
    "userId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CreatorDevice_pkey" PRIMARY KEY ("signingPublicKey")
);

-- CreateTable
CREATE TABLE "Workspace" (
    "id" TEXT NOT NULL,
    "idSignature" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Workspace_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UsersToWorkspaces" (
    "userId" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'VIEWER',
    "isAuthorizedMember" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "UsersToWorkspaces_pkey" PRIMARY KEY ("userId","workspaceId")
);

-- CreateTable
CREATE TABLE "WorkspaceKey" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "generation" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "WorkspaceKey_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkspaceKeyBox" (
    "id" TEXT NOT NULL,
    "workspaceKeyId" TEXT NOT NULL,
    "deviceSigningPublicKey" TEXT NOT NULL,
    "creatorDeviceSigningPublicKey" TEXT NOT NULL,
    "nonce" TEXT NOT NULL,
    "ciphertext" TEXT NOT NULL,

    CONSTRAINT "WorkspaceKeyBox_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Folder" (
    "id" TEXT NOT NULL,
    "idSignature" TEXT NOT NULL,
    "encryptedName" TEXT NOT NULL,
    "encryptedNameNonce" TEXT NOT NULL,
    "subkeyId" INTEGER NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "workspaceKeyId" TEXT NOT NULL,
    "parentFolderId" TEXT,
    "keyDerivationTrace" JSONB NOT NULL DEFAULT '{}',
    "rootFolderId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Folder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DocumentShareLink" (
    "token" TEXT NOT NULL,
    "sharerUserId" TEXT NOT NULL,
    "documentId" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'VIEWER',
    "deviceSecretBoxCiphertext" TEXT NOT NULL,
    "deviceSecretBoxNonce" TEXT NOT NULL,
    "deviceSigningPublicKey" TEXT NOT NULL,
    "deviceEncryptionPublicKey" TEXT NOT NULL,
    "deviceEncryptionPublicKeySignature" TEXT NOT NULL,

    CONSTRAINT "DocumentShareLink_pkey" PRIMARY KEY ("token")
);

-- CreateTable
CREATE TABLE "SnapshotKeyBox" (
    "id" TEXT NOT NULL,
    "snapshotId" TEXT NOT NULL,
    "deviceSigningPublicKey" TEXT NOT NULL,
    "creatorDeviceSigningPublicKey" TEXT NOT NULL,
    "nonce" TEXT NOT NULL,
    "ciphertext" TEXT NOT NULL,
    "documentShareLinkToken" TEXT NOT NULL,

    CONSTRAINT "SnapshotKeyBox_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Document_activeSnapshotId_key" ON "Document"("activeSnapshotId");

-- CreateIndex
CREATE UNIQUE INDEX "Document_subkeyId_workspaceId_key" ON "Document"("subkeyId", "workspaceId");

-- CreateIndex
CREATE UNIQUE INDEX "Update_snapshotId_version_key" ON "Update"("snapshotId", "version");

-- CreateIndex
CREATE UNIQUE INDEX "Update_snapshotId_pubKey_snapshotVersion_key" ON "Update"("snapshotId", "pubKey", "snapshotVersion");

-- CreateIndex
CREATE UNIQUE INDEX "UnverifiedUser_mainDeviceNonce_key" ON "UnverifiedUser"("mainDeviceNonce");

-- CreateIndex
CREATE UNIQUE INDEX "UnverifiedUser_mainDeviceSigningPublicKey_key" ON "UnverifiedUser"("mainDeviceSigningPublicKey");

-- CreateIndex
CREATE UNIQUE INDEX "UnverifiedUser_mainDeviceEncryptionPublicKey_key" ON "UnverifiedUser"("mainDeviceEncryptionPublicKey");

-- CreateIndex
CREATE UNIQUE INDEX "UnverifiedUser_mainDeviceEncryptionPublicKeySignature_key" ON "UnverifiedUser"("mainDeviceEncryptionPublicKeySignature");

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "User_mainDeviceNonce_key" ON "User"("mainDeviceNonce");

-- CreateIndex
CREATE UNIQUE INDEX "User_mainDeviceSigningPublicKey_key" ON "User"("mainDeviceSigningPublicKey");

-- CreateIndex
CREATE UNIQUE INDEX "RecoveryDevice_nonce_key" ON "RecoveryDevice"("nonce");

-- CreateIndex
CREATE UNIQUE INDEX "RecoveryDevice_userId_key" ON "RecoveryDevice"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Device_signingPublicKey_key" ON "Device"("signingPublicKey");

-- CreateIndex
CREATE UNIQUE INDEX "CreatorDevice_signingPublicKey_key" ON "CreatorDevice"("signingPublicKey");

-- CreateIndex
CREATE INDEX "Workspace_createdAt_idx" ON "Workspace"("createdAt" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "WorkspaceKey_id_key" ON "WorkspaceKey"("id");

-- CreateIndex
CREATE UNIQUE INDEX "WorkspaceKeyBox_id_key" ON "WorkspaceKeyBox"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Folder_id_key" ON "Folder"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Folder_subkeyId_workspaceId_key" ON "Folder"("subkeyId", "workspaceId");

-- CreateIndex
CREATE UNIQUE INDEX "DocumentShareLink_token_key" ON "DocumentShareLink"("token");

-- CreateIndex
CREATE UNIQUE INDEX "DocumentShareLink_deviceSigningPublicKey_key" ON "DocumentShareLink"("deviceSigningPublicKey");

-- CreateIndex
CREATE UNIQUE INDEX "DocumentShareLink_deviceEncryptionPublicKey_key" ON "DocumentShareLink"("deviceEncryptionPublicKey");

-- CreateIndex
CREATE UNIQUE INDEX "DocumentShareLink_deviceEncryptionPublicKeySignature_key" ON "DocumentShareLink"("deviceEncryptionPublicKeySignature");

-- CreateIndex
CREATE UNIQUE INDEX "SnapshotKeyBox_id_key" ON "SnapshotKeyBox"("id");

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_activeSnapshotId_fkey" FOREIGN KEY ("activeSnapshotId") REFERENCES "Snapshot"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_workspaceKeyId_fkey" FOREIGN KEY ("workspaceKeyId") REFERENCES "WorkspaceKey"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_parentFolderId_fkey" FOREIGN KEY ("parentFolderId") REFERENCES "Folder"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Snapshot" ADD CONSTRAINT "Snapshot_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "Document"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Update" ADD CONSTRAINT "Update_snapshotId_fkey" FOREIGN KEY ("snapshotId") REFERENCES "Snapshot"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_mainDeviceSigningPublicKey_fkey" FOREIGN KEY ("mainDeviceSigningPublicKey") REFERENCES "Device"("signingPublicKey") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_deviceSigningPublicKey_fkey" FOREIGN KEY ("deviceSigningPublicKey") REFERENCES "Device"("signingPublicKey") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkspaceInvitations" ADD CONSTRAINT "WorkspaceInvitations_inviterUserId_fkey" FOREIGN KEY ("inviterUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkspaceInvitations" ADD CONSTRAINT "WorkspaceInvitations_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecoveryDevice" ADD CONSTRAINT "RecoveryDevice_deviceSigningPublicKey_fkey" FOREIGN KEY ("deviceSigningPublicKey") REFERENCES "Device"("signingPublicKey") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecoveryDevice" ADD CONSTRAINT "RecoveryDevice_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Device" ADD CONSTRAINT "Device_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CreatorDevice" ADD CONSTRAINT "CreatorDevice_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UsersToWorkspaces" ADD CONSTRAINT "UsersToWorkspaces_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UsersToWorkspaces" ADD CONSTRAINT "UsersToWorkspaces_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkspaceKey" ADD CONSTRAINT "WorkspaceKey_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkspaceKeyBox" ADD CONSTRAINT "WorkspaceKeyBox_workspaceKeyId_fkey" FOREIGN KEY ("workspaceKeyId") REFERENCES "WorkspaceKey"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkspaceKeyBox" ADD CONSTRAINT "WorkspaceKeyBox_creatorDeviceSigningPublicKey_fkey" FOREIGN KEY ("creatorDeviceSigningPublicKey") REFERENCES "CreatorDevice"("signingPublicKey") ON DELETE SET DEFAULT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Folder" ADD CONSTRAINT "Folder_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Folder" ADD CONSTRAINT "Folder_workspaceKeyId_fkey" FOREIGN KEY ("workspaceKeyId") REFERENCES "WorkspaceKey"("id") ON DELETE SET DEFAULT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Folder" ADD CONSTRAINT "Folder_parentFolderId_fkey" FOREIGN KEY ("parentFolderId") REFERENCES "Folder"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Folder" ADD CONSTRAINT "Folder_rootFolderId_fkey" FOREIGN KEY ("rootFolderId") REFERENCES "Folder"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentShareLink" ADD CONSTRAINT "DocumentShareLink_sharerUserId_fkey" FOREIGN KEY ("sharerUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentShareLink" ADD CONSTRAINT "DocumentShareLink_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "Document"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SnapshotKeyBox" ADD CONSTRAINT "SnapshotKeyBox_snapshotId_fkey" FOREIGN KEY ("snapshotId") REFERENCES "Snapshot"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SnapshotKeyBox" ADD CONSTRAINT "SnapshotKeyBox_documentShareLinkToken_fkey" FOREIGN KEY ("documentShareLinkToken") REFERENCES "DocumentShareLink"("token") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SnapshotKeyBox" ADD CONSTRAINT "SnapshotKeyBox_creatorDeviceSigningPublicKey_fkey" FOREIGN KEY ("creatorDeviceSigningPublicKey") REFERENCES "CreatorDevice"("signingPublicKey") ON DELETE SET DEFAULT ON UPDATE CASCADE;
