/*
  Warnings:

  - You are about to drop the column `keyDerivationTrace` on the `Comment` table. All the data in the column will be lost.
  - You are about to drop the column `workspaceKeyId` on the `Comment` table. All the data in the column will be lost.
  - You are about to drop the column `keyDerivationTrace` on the `CommentReply` table. All the data in the column will be lost.
  - You are about to drop the column `workspaceKeyId` on the `CommentReply` table. All the data in the column will be lost.
  - Added the required column `snapshotId` to the `Comment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `subkeyId` to the `Comment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `snapshotId` to the `CommentReply` table without a default value. This is not possible if the table is not empty.
  - Added the required column `subkeyId` to the `CommentReply` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Comment" DROP CONSTRAINT "Comment_workspaceKeyId_fkey";

-- DropForeignKey
ALTER TABLE "CommentReply" DROP CONSTRAINT "CommentReply_workspaceKeyId_fkey";

-- AlterTable
ALTER TABLE "Comment" DROP COLUMN "keyDerivationTrace",
DROP COLUMN "workspaceKeyId",
ADD COLUMN     "snapshotId" TEXT NOT NULL,
ADD COLUMN     "subkeyId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "CommentReply" DROP COLUMN "keyDerivationTrace",
DROP COLUMN "workspaceKeyId",
ADD COLUMN     "snapshotId" TEXT NOT NULL,
ADD COLUMN     "subkeyId" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_snapshotId_fkey" FOREIGN KEY ("snapshotId") REFERENCES "Snapshot"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommentReply" ADD CONSTRAINT "CommentReply_snapshotId_fkey" FOREIGN KEY ("snapshotId") REFERENCES "Snapshot"("id") ON DELETE CASCADE ON UPDATE CASCADE;
