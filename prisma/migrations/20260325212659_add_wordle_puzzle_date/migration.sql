-- AlterTable
ALTER TABLE "WordleResult" ADD COLUMN     "puzzleDate" TEXT NOT NULL DEFAULT '';

-- CreateIndex
CREATE INDEX "WordleResult_puzzleDate_idx" ON "WordleResult"("puzzleDate");
