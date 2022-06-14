-- AlterTable
ALTER TABLE "Device" ADD COLUMN     "encryptionKeyType" TEXT NOT NULL DEFAULT E'invalid',
ADD COLUMN     "signingKeyType" TEXT NOT NULL DEFAULT E'invalid';
