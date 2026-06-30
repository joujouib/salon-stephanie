/*
  Warnings:

  - You are about to drop the column `serviceId` on the `QueueEntry` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "QueueEntry" DROP CONSTRAINT "QueueEntry_serviceId_fkey";

-- AlterTable
ALTER TABLE "QueueEntry" DROP COLUMN "serviceId";

-- CreateTable
CREATE TABLE "VisitService" (
    "id" TEXT NOT NULL,
    "priceCharged" INTEGER,
    "queueEntryId" TEXT NOT NULL,
    "serviceId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VisitService_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "VisitService" ADD CONSTRAINT "VisitService_queueEntryId_fkey" FOREIGN KEY ("queueEntryId") REFERENCES "QueueEntry"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VisitService" ADD CONSTRAINT "VisitService_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
