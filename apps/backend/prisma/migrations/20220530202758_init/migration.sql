/*
  Warnings:

  - You are about to drop the column `oprfCipherText` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `oprfNonce` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `oprfPrivateKey` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `oprfPublicKey` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `resetPasswordToken` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `serverPrivateKey` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `serverPublicKey` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `sharedRx` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `sharedTx` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `Registration` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `UserLoginAccessToken` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `opaqueEnvelope` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "UserLoginAccessToken" DROP CONSTRAINT "UserLoginAccessToken_username_fkey";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "oprfCipherText",
DROP COLUMN "oprfNonce",
DROP COLUMN "oprfPrivateKey",
DROP COLUMN "oprfPublicKey",
DROP COLUMN "resetPasswordToken",
DROP COLUMN "serverPrivateKey",
DROP COLUMN "serverPublicKey",
DROP COLUMN "sharedRx",
DROP COLUMN "sharedTx",
ADD COLUMN     "opaqueEnvelope" TEXT NOT NULL;

-- DropTable
DROP TABLE "Registration";

-- DropTable
DROP TABLE "UserLoginAccessToken";
