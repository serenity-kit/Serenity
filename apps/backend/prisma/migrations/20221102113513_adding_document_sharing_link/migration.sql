-- CreateTable
CREATE TABLE "DocumentShareLink" (
    "token" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'VIEWER',
    "deviceSecretBoxCipherText" TEXT NOT NULL,
    "deviceSecretBoxNonce" TEXT NOT NULL,
    "deviceSigningPublicKey" TEXT NOT NULL,
    "deviceEncryptionPublicKey" TEXT NOT NULL,
    "deviceEncryptionPublicKeySignature" TEXT NOT NULL,

    CONSTRAINT "DocumentShareLink_pkey" PRIMARY KEY ("token")
);

-- CreateIndex
CREATE UNIQUE INDEX "DocumentShareLink_token_key" ON "DocumentShareLink"("token");
