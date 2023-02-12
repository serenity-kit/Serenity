/*
  Warnings:

  - You are about to drop the column `contentKeyDerivationTrace` on the `Comment` table. All the data in the column will be lost.
  - You are about to drop the column `encryptedContent` on the `Comment` table. All the data in the column will be lost.
  - You are about to drop the column `encryptedContentNonce` on the `Comment` table. All the data in the column will be lost.
  - You are about to drop the column `contentKeyDerivationTrace` on the `CommentReply` table. All the data in the column will be lost.
  - You are about to drop the column `encryptedContent` on the `CommentReply` table. All the data in the column will be lost.
  - You are about to drop the column `encryptedContentNonce` on the `CommentReply` table. All the data in the column will be lost.
  - Added the required column `contentCiphertext` to the `Comment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `contentNonce` to the `Comment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `contentCiphertext` to the `CommentReply` table without a default value. This is not possible if the table is not empty.
  - Added the required column `contentNonce` to the `CommentReply` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Comment" DROP COLUMN "contentKeyDerivationTrace",
DROP COLUMN "encryptedContent",
DROP COLUMN "encryptedContentNonce",
ADD COLUMN     "contentCiphertext" TEXT NOT NULL,
ADD COLUMN     "contentNonce" TEXT NOT NULL,
ADD COLUMN     "keyDerivationTrace" JSONB NOT NULL DEFAULT '{}';

-- AlterTable
ALTER TABLE "CommentReply" DROP COLUMN "contentKeyDerivationTrace",
DROP COLUMN "encryptedContent",
DROP COLUMN "encryptedContentNonce",
ADD COLUMN     "contentCiphertext" TEXT NOT NULL,
ADD COLUMN     "contentNonce" TEXT NOT NULL,
ADD COLUMN     "keyDerivationTrace" JSONB NOT NULL DEFAULT '{}';
