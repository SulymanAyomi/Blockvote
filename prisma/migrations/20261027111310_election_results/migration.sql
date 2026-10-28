-- AlterTable
ALTER TABLE "Election" ADD COLUMN     "resultsPublishAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "ElectionTally" (
    "id" UUID NOT NULL,
    "electionId" UUID NOT NULL,
    "electionPositionId" UUID NOT NULL,
    "candidateId" UUID NOT NULL,
    "votes" INTEGER NOT NULL,

    CONSTRAINT "ElectionTally_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ElectionTally_electionId_idx" ON "ElectionTally"("electionId");

-- CreateIndex
CREATE UNIQUE INDEX "ElectionTally_electionId_electionPositionId_candidateId_key" ON "ElectionTally"("electionId", "electionPositionId", "candidateId");

-- AddForeignKey
ALTER TABLE "ElectionTally" ADD CONSTRAINT "ElectionTally_electionId_fkey" FOREIGN KEY ("electionId") REFERENCES "Election"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
