-- AlterTable: add nullable lastReadAt for per-user read tracking (backward-compatible)
ALTER TABLE "ConversationParticipant" ADD COLUMN "lastReadAt" TIMESTAMP(3);
