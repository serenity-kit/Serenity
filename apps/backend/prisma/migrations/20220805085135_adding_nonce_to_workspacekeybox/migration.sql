-- AlterTable
ALTER TABLE "WorkspaceKeyBox" ADD COLUMN     "creatingDeviceSigningPublicKey" TEXT NOT NULL DEFAULT E'invalid',
ADD COLUMN     "nonce" TEXT NOT NULL DEFAULT E'invalid';
