-- CreateEnum
CREATE TYPE "ConversationType" AS ENUM ('DIRECT', 'GROUP');

-- AlterTable: add new columns to Conversation (all nullable/defaulted for backward compatibility)
ALTER TABLE "Conversation" ADD COLUMN "type" "ConversationType" NOT NULL DEFAULT 'DIRECT';
ALTER TABLE "Conversation" ADD COLUMN "title" TEXT;
ALTER TABLE "Conversation" ADD COLUMN "eventId" TEXT;
ALTER TABLE "Conversation" ADD COLUMN "createdById" TEXT;

-- CreateIndex: unique constraint so one event can have at most one linked conversation
CREATE UNIQUE INDEX "Conversation_eventId_key" ON "Conversation"("eventId");

-- CreateIndex
CREATE INDEX "Conversation_eventId_idx" ON "Conversation"("eventId");

-- CreateIndex
CREATE INDEX "Conversation_createdById_idx" ON "Conversation"("createdById");

-- AddForeignKey
ALTER TABLE "Conversation" ADD CONSTRAINT "Conversation_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Conversation" ADD CONSTRAINT "Conversation_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
