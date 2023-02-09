-- CreateTable
CREATE TABLE "CommentReply" (
    "id" TEXT NOT NULL,
    "documentId" TEXT NOT NULL,
    "commentId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "encryptedContent" TEXT NOT NULL,
    "encryptedContentNonce" TEXT NOT NULL,
    "contentKeyDerivationTrace" JSONB NOT NULL DEFAULT '{}',
    "creatorDeviceSigningPublicKey" TEXT NOT NULL,

    CONSTRAINT "CommentReply_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CommentReply_documentId_key" ON "CommentReply"("documentId");

-- CreateIndex
CREATE UNIQUE INDEX "CommentReply_commentId_key" ON "CommentReply"("commentId");

-- AddForeignKey
ALTER TABLE "CommentReply" ADD CONSTRAINT "CommentReply_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "Document"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommentReply" ADD CONSTRAINT "CommentReply_commentId_fkey" FOREIGN KEY ("commentId") REFERENCES "Comment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommentReply" ADD CONSTRAINT "CommentReply_creatorDeviceSigningPublicKey_fkey" FOREIGN KEY ("creatorDeviceSigningPublicKey") REFERENCES "CreatorDevice"("signingPublicKey") ON DELETE SET DEFAULT ON UPDATE CASCADE;
