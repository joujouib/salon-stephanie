-- CreateTable
CREATE TABLE "ClientHairProfile" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "naturalLevel" INTEGER,
    "thickness" TEXT,
    "porosity" TEXT,
    "treatments" TEXT,
    "allergies" TEXT,
    "notes" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ClientHairProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClientFormula" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "colorCode" TEXT,
    "brand" TEXT,
    "developerVol" TEXT,
    "mixRatio" TEXT,
    "processingMins" INTEGER,
    "notes" TEXT,
    "rating" TEXT,
    "performedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ClientFormula_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ClientHairProfile_clientId_key" ON "ClientHairProfile"("clientId");

-- AddForeignKey
ALTER TABLE "ClientHairProfile" ADD CONSTRAINT "ClientHairProfile_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClientFormula" ADD CONSTRAINT "ClientFormula_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
