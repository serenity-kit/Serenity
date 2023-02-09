/*
  Warnings:

  - A unique constraint covering the columns `[id]` on the table `CommentReply` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "CommentReply_commentId_key";

-- DropIndex
DROP INDEX "CommentReply_documentId_key";

-- CreateIndex
CREATE UNIQUE INDEX "CommentReply_id_key" ON "CommentReply"("id");
