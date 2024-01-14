/*
  Warnings:

  - Added the required column `infoCreatorDeviceSigningPublicKey` to the `Workspace` table without a default value. This is not possible if the table is not empty.
  - Added the required column `infoSignature` to the `Workspace` table without a default value. This is not possible if the table is not empty.
  - Added the required column `infoWorkspaceMemberDevicesProofHash` to the `Workspace` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Workspace" ADD COLUMN     "infoCreatorDeviceSigningPublicKey" TEXT NOT NULL,
ADD COLUMN     "infoSignature" TEXT NOT NULL,
ADD COLUMN     "infoWorkspaceMemberDevicesProofHash" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "Workspace" ADD CONSTRAINT "Workspace_infoCreatorDeviceSigningPublicKey_fkey" FOREIGN KEY ("infoCreatorDeviceSigningPublicKey") REFERENCES "CreatorDevice"("signingPublicKey") ON DELETE SET DEFAULT ON UPDATE CASCADE;
