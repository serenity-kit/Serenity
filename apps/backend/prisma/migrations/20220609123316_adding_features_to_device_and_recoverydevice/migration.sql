-- CreateTable
CREATE TABLE "UnconfirmedUser" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "clientPublicKey" TEXT NOT NULL,
    "opaqueEnvelope" TEXT NOT NULL,
    "passwordResetOneTimePassword" TEXT,
    "passwordResetOneTimePasswordExpireDateTime" TIMESTAMP(3),

    CONSTRAINT "UnconfirmedUser_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UnconfirmedUser_username_key" ON "UnconfirmedUser"("username");
