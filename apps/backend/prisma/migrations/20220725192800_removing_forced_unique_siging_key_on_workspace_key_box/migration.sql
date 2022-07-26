/*
  Warnings:

  - The primary key for the `WorkspaceKeyBox` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - A unique constraint covering the columns `[id]` on the table `WorkspaceKeyBox` will be added. If there are existing duplicate values, this will fail.
  - The required column `id` was added to the `WorkspaceKeyBox` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.

*/
-- AlterTable
ALTER TABLE "WorkspaceKeyBox" DROP CONSTRAINT "WorkspaceKeyBox_pkey",
ADD COLUMN     "id" TEXT NOT NULL,
ADD CONSTRAINT "WorkspaceKeyBox_pkey" PRIMARY KEY ("id");

-- CreateIndex
CREATE UNIQUE INDEX "WorkspaceKeyBox_id_key" ON "WorkspaceKeyBox"("id");
