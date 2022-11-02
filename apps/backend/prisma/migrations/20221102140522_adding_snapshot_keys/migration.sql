-- CreateTable
CREATE TABLE "SnapshotKey" (
    "id" TEXT NOT NULL,
    "snapshotId" TEXT NOT NULL,
    "generation" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "SnapshotKey_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SnapshotKeyBox" (
    "id" TEXT NOT NULL,
    "snapshotKeyId" TEXT NOT NULL,
    "deviceSigningPublicKey" TEXT NOT NULL,
    "creatorDeviceSigningPublicKey" TEXT NOT NULL DEFAULT 'invalid',
    "nonce" TEXT NOT NULL DEFAULT 'invalid',
    "ciphertext" TEXT NOT NULL,

    CONSTRAINT "SnapshotKeyBox_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SnapshotKey_id_key" ON "SnapshotKey"("id");

-- CreateIndex
CREATE UNIQUE INDEX "SnapshotKeyBox_id_key" ON "SnapshotKeyBox"("id");

-- AddForeignKey
ALTER TABLE "SnapshotKey" ADD CONSTRAINT "SnapshotKey_snapshotId_fkey" FOREIGN KEY ("snapshotId") REFERENCES "Snapshot"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SnapshotKeyBox" ADD CONSTRAINT "SnapshotKeyBox_snapshotKeyId_fkey" FOREIGN KEY ("snapshotKeyId") REFERENCES "SnapshotKey"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SnapshotKeyBox" ADD CONSTRAINT "SnapshotKeyBox_creatorDeviceSigningPublicKey_fkey" FOREIGN KEY ("creatorDeviceSigningPublicKey") REFERENCES "CreatorDevice"("signingPublicKey") ON DELETE SET DEFAULT ON UPDATE CASCADE;
