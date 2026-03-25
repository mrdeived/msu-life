-- CreateTable
CREATE TABLE "WordleResult" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "won" BOOLEAN NOT NULL,
    "attempts" INTEGER NOT NULL,
    "maxAttempts" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WordleResult_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "WordleResult_userId_idx" ON "WordleResult"("userId");

-- CreateIndex
CREATE INDEX "WordleResult_createdAt_idx" ON "WordleResult"("createdAt");

-- AddForeignKey
ALTER TABLE "WordleResult" ADD CONSTRAINT "WordleResult_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
