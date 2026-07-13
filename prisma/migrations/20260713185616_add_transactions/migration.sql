-- CreateTable
CREATE TABLE "Transaction" (
    "id" TEXT NOT NULL,
    "queueEntryId" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "subtotal" INTEGER NOT NULL,
    "discountType" TEXT,
    "discountValue" INTEGER,
    "totalAfterDiscount" INTEGER NOT NULL,
    "paymentMethod" TEXT NOT NULL,
    "tipTotal" INTEGER NOT NULL DEFAULT 0,
    "isLocked" BOOLEAN NOT NULL DEFAULT true,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Transaction_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Transaction_queueEntryId_key" ON "Transaction"("queueEntryId");

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_queueEntryId_fkey" FOREIGN KEY ("queueEntryId") REFERENCES "QueueEntry"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
