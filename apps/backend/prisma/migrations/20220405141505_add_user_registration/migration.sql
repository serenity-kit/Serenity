-- CreateTable
CREATE TABLE "Registration" (
    "username" TEXT NOT NULL,
    "serverPrivateKey" TEXT NOT NULL,
    "oprfPrivateKey" TEXT NOT NULL,

    CONSTRAINT "Registration_pkey" PRIMARY KEY ("username")
);

-- CreateTable
CREATE TABLE "User" (
    "username" TEXT NOT NULL,
    "serverPrivateKey" TEXT NOT NULL,
    "oprfPrivateKey" TEXT NOT NULL,
    "cipherText" TEXT NOT NULL,
    "nonce" TEXT NOT NULL,
    "clientPublicKey" TEXT NOT NULL,
    "sessionPrivateKey" TEXT,
    "resetPasswordToken" TEXT,

    CONSTRAINT "User_pkey" PRIMARY KEY ("username")
);
