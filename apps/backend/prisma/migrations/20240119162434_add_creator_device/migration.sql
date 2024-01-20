/*
  Warnings:

  - Added the required column `nameCreatorDeviceSigningPublicKey` to the `Document` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Document" ADD COLUMN     "nameCreatorDeviceSigningPublicKey" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_nameCreatorDeviceSigningPublicKey_fkey" FOREIGN KEY ("nameCreatorDeviceSigningPublicKey") REFERENCES "CreatorDevice"("signingPublicKey") ON DELETE SET DEFAULT ON UPDATE CASCADE;
