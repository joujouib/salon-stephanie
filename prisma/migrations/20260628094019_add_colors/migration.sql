-- CreateTable
CREATE TABLE "Color" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "hex" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "undertone" TEXT NOT NULL DEFAULT 'neutral',
    "lighteningLevel" TEXT NOT NULL DEFAULT 'none',
    "suitableFor" TEXT NOT NULL DEFAULT 'light,medium,dark',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Color_pkey" PRIMARY KEY ("id")
);
