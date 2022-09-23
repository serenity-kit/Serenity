-- CreateTable
CREATE TABLE "CreatorDevice" (
    "signingPublicKey" TEXT NOT NULL,
    "encryptionPublicKey" TEXT NOT NULL,
    "encryptionPublicKeySignature" TEXT NOT NULL,
    "userId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CreatorDevice_pkey" PRIMARY KEY ("signingPublicKey")
);

-- CreateIndex
CREATE UNIQUE INDEX "CreatorDevice_signingPublicKey_key" ON "CreatorDevice"("signingPublicKey");

-- AddForeignKey
ALTER TABLE "CreatorDevice" ADD CONSTRAINT "CreatorDevice_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkspaceKeyBox" ADD CONSTRAINT "WorkspaceKeyBox_creatorDeviceSigningPublicKey_fkey" FOREIGN KEY ("creatorDeviceSigningPublicKey") REFERENCES "CreatorDevice"("signingPublicKey") ON DELETE SET DEFAULT ON UPDATE CASCADE;
