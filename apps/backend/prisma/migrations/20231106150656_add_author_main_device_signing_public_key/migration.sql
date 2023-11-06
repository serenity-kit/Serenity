/*
  Warnings:

  - Added the required column `authorMainDeviceSigningPublicKey` to the `WorkspaceMemberDevicesProof` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "WorkspaceMemberDevicesProof" ADD COLUMN     "authorMainDeviceSigningPublicKey" TEXT NOT NULL;
