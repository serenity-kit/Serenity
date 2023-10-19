-- CreateTable
CREATE TABLE "DocumentChainEvent" (
    "position" INTEGER NOT NULL,
    "content" JSONB NOT NULL,
    "state" JSONB NOT NULL,
    "documentId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DocumentChainEvent_pkey" PRIMARY KEY ("documentId","position")
);

-- CreateIndex
CREATE INDEX "DocumentChainEvent_documentId_position_idx" ON "DocumentChainEvent"("documentId", "position" ASC);

-- AddForeignKey
ALTER TABLE "DocumentChainEvent" ADD CONSTRAINT "DocumentChainEvent_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "Document"("id") ON DELETE CASCADE ON UPDATE CASCADE;
