-- CreateTable
CREATE TABLE "UserChainEvent" (
    "position" INTEGER NOT NULL,
    "content" JSONB NOT NULL,
    "state" JSONB NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserChainEvent_pkey" PRIMARY KEY ("userId","position")
);

-- CreateIndex
CREATE INDEX "UserChainEvent_userId_position_idx" ON "UserChainEvent"("userId", "position" ASC);

-- AddForeignKey
ALTER TABLE "UserChainEvent" ADD CONSTRAINT "UserChainEvent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
