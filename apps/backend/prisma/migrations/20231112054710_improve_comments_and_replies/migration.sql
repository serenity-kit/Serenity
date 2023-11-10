/*
  Warnings:

  - Added the required column `signature` to the `Comment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `signature` to the `CommentReply` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Comment" ADD COLUMN     "signature" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "CommentReply" ADD COLUMN     "signature" TEXT NOT NULL;
