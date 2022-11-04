-- AlterTable
ALTER TABLE "DocumentShareLink" ADD COLUMN     "deviceSecretBoxCipherText" TEXT NOT NULL DEFAULT 'invalid',
ADD COLUMN     "deviceSecretBoxNonce" TEXT NOT NULL DEFAULT 'invalid',
ADD COLUMN     "sharerUserId" TEXT NOT NULL DEFAULT 'invalid';
