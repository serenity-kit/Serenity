/*
  Warnings:

  - The `role` column on the `DocumentShareLink` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "ShareDocumentRole" AS ENUM ('EDITOR', 'COMMENTER', 'VIEWER');

-- AlterTable
ALTER TABLE "DocumentShareLink" DROP COLUMN "role",
ADD COLUMN     "role" "ShareDocumentRole" NOT NULL DEFAULT 'VIEWER';
