-- CreateTable
CREATE TABLE "WordleScheduledWord" (
    "id" TEXT NOT NULL,
    "puzzleDate" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WordleScheduledWord_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "WordleScheduledWord_puzzleDate_key" ON "WordleScheduledWord"("puzzleDate");

-- CreateIndex
CREATE INDEX "WordleScheduledWord_puzzleDate_idx" ON "WordleScheduledWord"("puzzleDate");

-- AddForeignKey
ALTER TABLE "WordleScheduledWord" ADD CONSTRAINT "WordleScheduledWord_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
