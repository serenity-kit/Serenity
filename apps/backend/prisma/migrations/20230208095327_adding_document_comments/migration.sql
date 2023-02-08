-- CreateTable
CREATE TABLE "Comment" (
    "id" TEXT NOT NULL,
    "documentId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "encryptedContent" TEXT NOT NULL,
    "encryptedContentNonce" TEXT NOT NULL,
    "contentKeyDerivationTrace" JSONB NOT NULL DEFAULT '{}',
    "creatorDeviceSigningPublicKey" TEXT NOT NULL,

    CONSTRAINT "Comment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Comment_documentId_key" ON "Comment"("documentId");

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "Document"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_creatorDeviceSigningPublicKey_fkey" FOREIGN KEY ("creatorDeviceSigningPublicKey") REFERENCES "CreatorDevice"("signingPublicKey") ON DELETE SET DEFAULT ON UPDATE CASCADE;
