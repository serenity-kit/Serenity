/*
  Warnings:

  - You are about to drop the column `opaqueEnvelope` on the `UnverifiedUser` table. All the data in the column will be lost.
  - You are about to drop the column `opaqueEnvelope` on the `User` table. All the data in the column will be lost.
  - Added the required column `registrationRecord` to the `UnverifiedUser` table without a default value. This is not possible if the table is not empty.
  - Added the required column `registrationRecord` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "UnverifiedUser" DROP COLUMN "opaqueEnvelope",
ADD COLUMN     "registrationRecord" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "opaqueEnvelope",
ADD COLUMN     "registrationRecord" TEXT NOT NULL;
