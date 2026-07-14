-- CreateTable
CREATE TABLE "DailyReconciliation" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "expectedCash" INTEGER NOT NULL,
    "actualCash" INTEGER NOT NULL,
    "difference" INTEGER NOT NULL,
    "tipsTotal" INTEGER NOT NULL,
    "notes" TEXT,
    "isLocked" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DailyReconciliation_pkey" PRIMARY KEY ("id")
);
