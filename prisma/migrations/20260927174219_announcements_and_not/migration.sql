-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('REMINDER', 'ANNOUNCEMENT', 'SYSTEM');

-- AlterTable
ALTER TABLE "Candidate" ADD COLUMN     "platform" TEXT[];

-- AlterTable
ALTER TABLE "Election" ADD COLUMN     "about" TEXT;

-- AlterTable
ALTER TABLE "ElectionPosition" ADD COLUMN     "description" TEXT;

-- CreateTable
CREATE TABLE "Notification" (
    "id" UUID NOT NULL,
    "type" "NotificationType" NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Announcement" (
    "id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Announcement_pkey" PRIMARY KEY ("id")
);
