-- CreateTable
CREATE TABLE "Session" (
    "sessionKey" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    "deviceSigningPublicKey" TEXT,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("sessionKey")
);

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_deviceSigningPublicKey_fkey" FOREIGN KEY ("deviceSigningPublicKey") REFERENCES "Device"("signingPublicKey") ON DELETE CASCADE ON UPDATE CASCADE;
