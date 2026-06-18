-- CreateTable
CREATE TABLE "Service" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "priceMin" INTEGER NOT NULL,
    "priceMax" INTEGER NOT NULL,
    "duration" INTEGER NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Service_pkey" PRIMARY KEY ("id")
);
