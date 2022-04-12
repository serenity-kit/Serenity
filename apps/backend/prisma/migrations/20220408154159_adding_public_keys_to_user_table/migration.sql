-- AlterTable
ALTER TABLE "User" ADD COLUMN     "oprfPublicKey" TEXT NOT NULL DEFAULT E'invalid',
ADD COLUMN     "serverPublicKey" TEXT NOT NULL DEFAULT E'invalid';
