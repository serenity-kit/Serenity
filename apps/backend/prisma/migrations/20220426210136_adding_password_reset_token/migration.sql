-- AlterTable
ALTER TABLE "User" ADD COLUMN     "passwordResetOneTimePassword" TEXT,
ADD COLUMN     "passwordResetRequestExpiration" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "OpaqueAuth" (
    "key" TEXT NOT NULL,
    "serverPublicKey" TEXT NOT NULL,
    "username" TEXT NOT NULL,

    CONSTRAINT "OpaqueAuth_pkey" PRIMARY KEY ("key")
);

-- CreateTable
CREATE TABLE "VirtualMasterDevice" (
    "id" TEXT NOT NULL,
    "encryptionPrivateKey" TEXT NOT NULL,
    "encryptionPublicKey" TEXT NOT NULL,
    "signingPrivateKey" TEXT NOT NULL,
    "signingPublicKey" TEXT NOT NULL,
    "signedRecoverSigningPublicKey" TEXT NOT NULL,
    "signedDeviceSignignPublicKey" TEXT NOT NULL,
    "username" TEXT NOT NULL,

    CONSTRAINT "VirtualMasterDevice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Device" (
    "id" TEXT NOT NULL,
    "encryptionPrivateKey" TEXT NOT NULL,
    "encryptionPublicKey" TEXT NOT NULL,
    "signingPrivateKey" TEXT NOT NULL,
    "signingPublicKey" TEXT NOT NULL,
    "username" TEXT NOT NULL,

    CONSTRAINT "Device_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VirtualRecoveryDevice" (
    "id" TEXT NOT NULL,
    "encryptionPrivateKey" TEXT NOT NULL,
    "encryptionPublicKey" TEXT NOT NULL,
    "signingPrivateKey" TEXT NOT NULL,
    "signingPublicKey" TEXT NOT NULL,
    "signedVirtualMasterSigningPublicKey" TEXT NOT NULL,
    "username" TEXT NOT NULL,

    CONSTRAINT "VirtualRecoveryDevice_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "OpaqueAuth_username_key" ON "OpaqueAuth"("username");

-- CreateIndex
CREATE UNIQUE INDEX "VirtualMasterDevice_username_key" ON "VirtualMasterDevice"("username");

-- CreateIndex
CREATE UNIQUE INDEX "VirtualRecoveryDevice_username_key" ON "VirtualRecoveryDevice"("username");

-- AddForeignKey
ALTER TABLE "OpaqueAuth" ADD CONSTRAINT "OpaqueAuth_username_fkey" FOREIGN KEY ("username") REFERENCES "User"("username") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VirtualMasterDevice" ADD CONSTRAINT "VirtualMasterDevice_username_fkey" FOREIGN KEY ("username") REFERENCES "User"("username") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Device" ADD CONSTRAINT "Device_username_fkey" FOREIGN KEY ("username") REFERENCES "User"("username") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VirtualRecoveryDevice" ADD CONSTRAINT "VirtualRecoveryDevice_username_fkey" FOREIGN KEY ("username") REFERENCES "User"("username") ON DELETE RESTRICT ON UPDATE CASCADE;
