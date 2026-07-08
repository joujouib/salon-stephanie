-- AlterTable
ALTER TABLE "QueueEntry" ADD COLUMN     "durationOverride" INTEGER;

-- CreateTable
CREATE TABLE "SalonSettings" (
    "id" TEXT NOT NULL,
    "activeStaffCount" INTEGER NOT NULL DEFAULT 3,

    CONSTRAINT "SalonSettings_pkey" PRIMARY KEY ("id")
);
