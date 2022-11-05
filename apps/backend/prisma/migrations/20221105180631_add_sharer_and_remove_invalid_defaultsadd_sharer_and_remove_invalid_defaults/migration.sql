-- AlterTable
ALTER TABLE "DocumentShareLink" ALTER COLUMN "deviceSecretBoxNonce" DROP DEFAULT,
ALTER COLUMN "sharerUserId" DROP DEFAULT,
ALTER COLUMN "deviceSecretBoxCiphertext" DROP DEFAULT;

-- AlterTable
ALTER TABLE "Folder" ALTER COLUMN "workspaceKeyId" DROP DEFAULT;

-- AlterTable
ALTER TABLE "SnapshotKeyBox" ALTER COLUMN "creatorDeviceSigningPublicKey" DROP DEFAULT,
ALTER COLUMN "nonce" DROP DEFAULT;

-- AlterTable
ALTER TABLE "WorkspaceKeyBox" ALTER COLUMN "nonce" DROP DEFAULT,
ALTER COLUMN "creatorDeviceSigningPublicKey" DROP DEFAULT;

-- AddForeignKey
ALTER TABLE "DocumentShareLink" ADD CONSTRAINT "DocumentShareLink_sharerUserId_fkey" FOREIGN KEY ("sharerUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
