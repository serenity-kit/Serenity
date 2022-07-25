/*
  Warnings:

  - The primary key for the `WorkspaceKeyBox` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `WorkspaceKeyBox` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "WorkspaceKeyBox_id_key";

-- AlterTable
ALTER TABLE "WorkspaceKey" ADD COLUMN     "generation" INTEGER NOT NULL DEFAULT 0,
ALTER COLUMN "workspaceId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "WorkspaceKeyBox" DROP CONSTRAINT "WorkspaceKeyBox_pkey",
DROP COLUMN "id",
ADD CONSTRAINT "WorkspaceKeyBox_pkey" PRIMARY KEY ("workspaceKeyId", "deviceSigningPublicKey");
