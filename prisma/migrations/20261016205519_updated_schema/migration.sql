/*
  Warnings:

  - You are about to drop the column `castAt` on the `Ballot` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Ballot` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `BlockchainBallot` table. All the data in the column will be lost.
  - You are about to drop the `IssuedNonce` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[ballotId,electionPositionId]` on the table `Vote` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[voterId,electionId]` on the table `VotingSession` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `batchId` to the `Ballot` table without a default value. This is not possible if the table is not empty.
  - Added the required column `authSessionId` to the `VotingSession` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "IssuedNonce" DROP CONSTRAINT "IssuedNonce_electionId_fkey";

-- DropIndex
DROP INDEX "one_active_session_per_voter_election";

-- AlterTable
ALTER TABLE "Ballot" DROP COLUMN "castAt",
DROP COLUMN "updatedAt",
ADD COLUMN     "batchId" UUID NOT NULL;

-- AlterTable
ALTER TABLE "BlockchainBallot" DROP COLUMN "createdAt";

-- AlterTable
ALTER TABLE "ElectionParticipation" ADD COLUMN     "faceAttempts" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "VotingSession" ADD COLUMN     "authSessionId" TEXT NOT NULL;

-- DropTable
DROP TABLE "IssuedNonce";

-- CreateTable
CREATE TABLE "SpentToken" (
    "tokenHash" TEXT NOT NULL,
    "electionId" UUID NOT NULL,

    CONSTRAINT "SpentToken_pkey" PRIMARY KEY ("tokenHash")
);

-- CreateTable
CREATE TABLE "PendingBallot" (
    "id" UUID NOT NULL,
    "electionId" UUID NOT NULL,
    "sealed" TEXT NOT NULL,

    CONSTRAINT "PendingBallot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BlockchainBatch" (
    "id" UUID NOT NULL,
    "electionId" UUID NOT NULL,
    "batchId" UUID NOT NULL,
    "ballotCount" INTEGER NOT NULL,
    "merkleRoot" TEXT NOT NULL,
    "polygonTxHash" TEXT,
    "status" "BlockchainStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BlockchainBatch_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SpentToken_electionId_idx" ON "SpentToken"("electionId");

-- CreateIndex
CREATE INDEX "PendingBallot_electionId_idx" ON "PendingBallot"("electionId");

-- CreateIndex
CREATE UNIQUE INDEX "BlockchainBatch_batchId_key" ON "BlockchainBatch"("batchId");

-- CreateIndex
CREATE INDEX "BlockchainBatch_electionId_idx" ON "BlockchainBatch"("electionId");

-- CreateIndex
CREATE INDEX "Ballot_batchId_idx" ON "Ballot"("batchId");

-- CreateIndex
CREATE UNIQUE INDEX "Vote_ballotId_electionPositionId_key" ON "Vote"("ballotId", "electionPositionId");

-- CreateIndex
CREATE UNIQUE INDEX "one_active_session_per_voter_election" ON "VotingSession"("voterId", "electionId") WHERE (status = ANY (ARRAY['PENDING'::"VotingSessionStatus", 'FACE_VERIFIED'::"VotingSessionStatus", 'TOKEN_ISSUED'::"VotingSessionStatus", 'COMPLETED'::"VotingSessionStatus"]));

-- AddForeignKey
ALTER TABLE "SpentToken" ADD CONSTRAINT "SpentToken_electionId_fkey" FOREIGN KEY ("electionId") REFERENCES "Election"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PendingBallot" ADD CONSTRAINT "PendingBallot_electionId_fkey" FOREIGN KEY ("electionId") REFERENCES "Election"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vote" ADD CONSTRAINT "Vote_electionPositionId_fkey" FOREIGN KEY ("electionPositionId") REFERENCES "ElectionPosition"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vote" ADD CONSTRAINT "Vote_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "Candidate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
