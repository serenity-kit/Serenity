-- CreateTable
CREATE TABLE "UserLoginAccessToken" (
    "accessToken" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3),
    "username" TEXT NOT NULL,

    CONSTRAINT "UserLoginAccessToken_pkey" PRIMARY KEY ("accessToken")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserLoginAccessToken_accessToken_key" ON "UserLoginAccessToken"("accessToken");

-- AddForeignKey
ALTER TABLE "UserLoginAccessToken" ADD CONSTRAINT "UserLoginAccessToken_username_fkey" FOREIGN KEY ("username") REFERENCES "User"("username") ON DELETE RESTRICT ON UPDATE CASCADE;
