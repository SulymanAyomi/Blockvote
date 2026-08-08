-- CreateEnum
CREATE TYPE "VotingSessionStatus" AS ENUM ('PENDING', 'FACE_VERIFIED', 'TOKEN_ISSUED', 'COMPLETED', 'EXPIRED', 'ABANDONED');

-- CreateEnum
CREATE TYPE "ScopeType" AS ENUM ('UNIVERSITY', 'CAMPUS', 'FACULTY', 'DEPARTMENT', 'PROGRAMME', 'LEVEL');

-- CreateEnum
CREATE TYPE "IdType" AS ENUM ('NIN', 'STUDENT_ID', 'PASSPORT', 'DRIVERS_LICENSE');

-- CreateEnum
CREATE TYPE "OtpPurpose" AS ENUM ('REGISTER', 'LOGIN', 'PASSWORD_RESET');

-- CreateEnum
CREATE TYPE "FaceProvider" AS ENUM ('PYTHON');

-- CreateEnum
CREATE TYPE "FaceReferenceStatus" AS ENUM ('ACTIVE', 'REVOKED', 'PENDING');

-- CreateEnum
CREATE TYPE "ElectionStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'OPEN', 'CLOSED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "ScopeField" AS ENUM ('UNIVERSITY', 'CAMPUS', 'FACULTY', 'DEPARTMENT', 'PROGRAMME', 'LEVEL');

-- CreateEnum
CREATE TYPE "ScopeOperator" AS ENUM ('EQUALS', 'IN');

-- CreateEnum
CREATE TYPE "AdminRole" AS ENUM ('SUPER_ADMIN', 'ELECTION_OFFICER');

-- CreateEnum
CREATE TYPE "BlockchainStatus" AS ENUM ('PENDING');

-- CreateTable
CREATE TABLE "voter_roll" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "idType" "IdType" NOT NULL,
    "idNumber" VARCHAR(20) NOT NULL,
    "studentId" VARCHAR(50),
    "fullName" VARCHAR(255) NOT NULL,
    "email" VARCHAR(255),
    "imageUrl" VARCHAR(255),
    "phone" VARCHAR(20),
    "campusId" UUID,
    "facultyId" UUID,
    "departmentId" UUID,
    "programmeId" UUID,
    "level" INTEGER,
    "dateOfBirth" DATE,
    "isRegistered" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "voter_roll_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "accounts" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "voterId" UUID NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "failedAttempts" INTEGER NOT NULL DEFAULT 0,
    "lockedUntil" TIMESTAMP(3),
    "lastLogin" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "otps" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "voterId" UUID NOT NULL,
    "otp_hash" TEXT NOT NULL,
    "purpose" "OtpPurpose" NOT NULL,
    "expires_at" TIMESTAMP NOT NULL,
    "used" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "otps_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "registration_sessions" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "voterId" UUID NOT NULL,
    "id_verified" BOOLEAN NOT NULL DEFAULT false,
    "otp_verified" BOOLEAN NOT NULL DEFAULT false,
    "face_verified" BOOLEAN NOT NULL DEFAULT false,
    "info_confirmed" BOOLEAN NOT NULL DEFAULT false,
    "expires_at" TIMESTAMP NOT NULL,
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "registration_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "face_references" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "voterId" UUID NOT NULL,
    "referenceId" TEXT NOT NULL,
    "provider" "FaceProvider" NOT NULL,
    "status" "FaceReferenceStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "face_references_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FaceEmbedding" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "faceReferenceId" UUID NOT NULL,
    "embedding" DOUBLE PRECISION[],
    "modelName" TEXT NOT NULL,
    "modelVersion" TEXT NOT NULL,
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FaceEmbedding_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Institution" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "shortName" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Institution_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Campus" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "institutionId" UUID NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Campus_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Faculty" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "institutionId" UUID NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Faculty_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Department" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "facultyId" UUID NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Department_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Programme" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "departmentId" UUID NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Programme_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AcademicSession" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" DATE,
    "isCurrent" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "AcademicSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Election" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "title" TEXT NOT NULL,
    "description" TEXT,
    "coverImage" TEXT,
    "academicSessionId" UUID NOT NULL,
    "startsAt" TIMESTAMP(3) NOT NULL,
    "endsAt" TIMESTAMP(3) NOT NULL,
    "status" "ElectionStatus" NOT NULL DEFAULT 'DRAFT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Election_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ElectionScope" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "electionId" UUID NOT NULL,
    "type" "ScopeType" NOT NULL,
    "value" TEXT NOT NULL,

    CONSTRAINT "ElectionScope_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Position" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Position_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ElectionPosition" (
    "id" UUID NOT NULL,
    "electionId" UUID NOT NULL,
    "positionId" UUID NOT NULL,

    CONSTRAINT "ElectionPosition_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Candidate" (
    "id" UUID NOT NULL,
    "electionPositionId" UUID NOT NULL,
    "voterId" UUID NOT NULL,
    "manifesto" TEXT,
    "campaignSlogan" VARCHAR(255),
    "imageUrl" TEXT,
    "cvUrl" TEXT,
    "socialLinks" JSONB,
    "isIndependent" BOOLEAN NOT NULL DEFAULT true,
    "partyAffiliation" VARCHAR(100),

    CONSTRAINT "Candidate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ElectionParticipation" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "electionId" UUID NOT NULL,
    "voterId" UUID NOT NULL,
    "eligible" BOOLEAN NOT NULL DEFAULT true,
    "hasVoted" BOOLEAN NOT NULL DEFAULT false,
    "votedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ElectionParticipation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VotingSession" (
    "id" TEXT NOT NULL,
    "voterId" UUID NOT NULL,
    "electionId" UUID NOT NULL,
    "status" "VotingSessionStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VotingSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IssuedNonce" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "electionId" UUID NOT NULL,
    "used" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "IssuedNonce_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Ballot" (
    "id" UUID NOT NULL,
    "electionId" UUID NOT NULL,
    "castAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Ballot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Vote" (
    "id" UUID NOT NULL,
    "ballotId" UUID NOT NULL,
    "electionPositionId" UUID NOT NULL,
    "candidateId" UUID NOT NULL,

    CONSTRAINT "Vote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BlockchainElection" (
    "id" TEXT NOT NULL,
    "electionId" TEXT NOT NULL,
    "contractAddress" TEXT NOT NULL,
    "electionHash" TEXT NOT NULL,
    "transactionHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BlockchainElection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BlockchainBallot" (
    "id" TEXT NOT NULL,
    "ballotId" TEXT NOT NULL,
    "ballotHash" TEXT NOT NULL,
    "polygonTxHash" TEXT,
    "status" "BlockchainStatus" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BlockchainBallot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BlockchainResult" (
    "id" TEXT NOT NULL,
    "electionId" TEXT NOT NULL,
    "resultHash" TEXT NOT NULL,
    "polygonTxHash" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BlockchainResult_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Admin" (
    "id" UUID NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "AdminRole" NOT NULL,

    CONSTRAINT "Admin_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" UUID NOT NULL,
    "adminId" UUID,
    "action" TEXT NOT NULL,
    "resource" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SystemSetting" (
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,

    CONSTRAINT "SystemSetting_pkey" PRIMARY KEY ("key")
);

-- CreateTable
CREATE TABLE "_ProgrammeToVoterRoll" (
    "A" UUID NOT NULL,
    "B" UUID NOT NULL,

    CONSTRAINT "_ProgrammeToVoterRoll_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "voter_roll_idType_idNumber_idx" ON "voter_roll"("idType", "idNumber");

-- CreateIndex
CREATE UNIQUE INDEX "voter_roll_idType_idNumber_key" ON "voter_roll"("idType", "idNumber");

-- CreateIndex
CREATE UNIQUE INDEX "accounts_voterId_key" ON "accounts"("voterId");

-- CreateIndex
CREATE INDEX "otps_expires_at_idx" ON "otps"("expires_at");

-- CreateIndex
CREATE INDEX "otps_voterId_purpose_idx" ON "otps"("voterId", "purpose");

-- CreateIndex
CREATE INDEX "registration_sessions_expires_at_idx" ON "registration_sessions"("expires_at");

-- CreateIndex
CREATE INDEX "registration_sessions_voterId_idx" ON "registration_sessions"("voterId");

-- CreateIndex
CREATE UNIQUE INDEX "face_references_voterId_key" ON "face_references"("voterId");

-- CreateIndex
CREATE UNIQUE INDEX "face_references_referenceId_key" ON "face_references"("referenceId");

-- CreateIndex
CREATE UNIQUE INDEX "FaceEmbedding_faceReferenceId_key" ON "FaceEmbedding"("faceReferenceId");

-- CreateIndex
CREATE INDEX "ElectionScope_electionId_idx" ON "ElectionScope"("electionId");

-- CreateIndex
CREATE UNIQUE INDEX "Position_name_key" ON "Position"("name");

-- CreateIndex
CREATE UNIQUE INDEX "ElectionPosition_electionId_positionId_key" ON "ElectionPosition"("electionId", "positionId");

-- CreateIndex
CREATE UNIQUE INDEX "Candidate_electionPositionId_voterId_key" ON "Candidate"("electionPositionId", "voterId");

-- CreateIndex
CREATE UNIQUE INDEX "ElectionParticipation_electionId_voterId_key" ON "ElectionParticipation"("electionId", "voterId");

-- CreateIndex
CREATE INDEX "VotingSession_voterId_electionId_idx" ON "VotingSession"("voterId", "electionId");

-- CreateIndex
CREATE INDEX "VotingSession_status_expiresAt_idx" ON "VotingSession"("status", "expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "IssuedNonce_token_key" ON "IssuedNonce"("token");

-- CreateIndex
CREATE INDEX "IssuedNonce_token_used_expiresAt_idx" ON "IssuedNonce"("token", "used", "expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "BlockchainElection_electionId_key" ON "BlockchainElection"("electionId");

-- CreateIndex
CREATE UNIQUE INDEX "BlockchainBallot_ballotId_key" ON "BlockchainBallot"("ballotId");

-- CreateIndex
CREATE UNIQUE INDEX "BlockchainResult_electionId_key" ON "BlockchainResult"("electionId");

-- CreateIndex
CREATE UNIQUE INDEX "Admin_email_key" ON "Admin"("email");

-- CreateIndex
CREATE INDEX "_ProgrammeToVoterRoll_B_index" ON "_ProgrammeToVoterRoll"("B");

-- CreateIndex
CREATE UNIQUE INDEX one_active_session_per_voter_election
ON "VotingSession" ("voterId", "electionId")
WHERE status IN ('PENDING', 'FACE_VERIFIED', 'TOKEN_ISSUED');

-- AddForeignKey
ALTER TABLE "voter_roll" ADD CONSTRAINT "voter_roll_campusId_fkey" FOREIGN KEY ("campusId") REFERENCES "Campus"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "voter_roll" ADD CONSTRAINT "voter_roll_facultyId_fkey" FOREIGN KEY ("facultyId") REFERENCES "Faculty"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "voter_roll" ADD CONSTRAINT "voter_roll_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_voterId_fkey" FOREIGN KEY ("voterId") REFERENCES "voter_roll"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "otps" ADD CONSTRAINT "otps_voterId_fkey" FOREIGN KEY ("voterId") REFERENCES "voter_roll"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "registration_sessions" ADD CONSTRAINT "registration_sessions_voterId_fkey" FOREIGN KEY ("voterId") REFERENCES "voter_roll"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "face_references" ADD CONSTRAINT "face_references_voterId_fkey" FOREIGN KEY ("voterId") REFERENCES "voter_roll"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FaceEmbedding" ADD CONSTRAINT "FaceEmbedding_faceReferenceId_fkey" FOREIGN KEY ("faceReferenceId") REFERENCES "face_references"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Campus" ADD CONSTRAINT "Campus_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "Institution"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Faculty" ADD CONSTRAINT "Faculty_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "Institution"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Department" ADD CONSTRAINT "Department_facultyId_fkey" FOREIGN KEY ("facultyId") REFERENCES "Faculty"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Programme" ADD CONSTRAINT "Programme_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Election" ADD CONSTRAINT "Election_academicSessionId_fkey" FOREIGN KEY ("academicSessionId") REFERENCES "AcademicSession"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ElectionScope" ADD CONSTRAINT "ElectionScope_electionId_fkey" FOREIGN KEY ("electionId") REFERENCES "Election"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ElectionPosition" ADD CONSTRAINT "ElectionPosition_electionId_fkey" FOREIGN KEY ("electionId") REFERENCES "Election"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ElectionPosition" ADD CONSTRAINT "ElectionPosition_positionId_fkey" FOREIGN KEY ("positionId") REFERENCES "Position"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Candidate" ADD CONSTRAINT "Candidate_electionPositionId_fkey" FOREIGN KEY ("electionPositionId") REFERENCES "ElectionPosition"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Candidate" ADD CONSTRAINT "Candidate_voterId_fkey" FOREIGN KEY ("voterId") REFERENCES "voter_roll"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ElectionParticipation" ADD CONSTRAINT "ElectionParticipation_electionId_fkey" FOREIGN KEY ("electionId") REFERENCES "Election"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ElectionParticipation" ADD CONSTRAINT "ElectionParticipation_voterId_fkey" FOREIGN KEY ("voterId") REFERENCES "voter_roll"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VotingSession" ADD CONSTRAINT "VotingSession_voterId_fkey" FOREIGN KEY ("voterId") REFERENCES "voter_roll"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VotingSession" ADD CONSTRAINT "VotingSession_electionId_fkey" FOREIGN KEY ("electionId") REFERENCES "Election"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IssuedNonce" ADD CONSTRAINT "IssuedNonce_electionId_fkey" FOREIGN KEY ("electionId") REFERENCES "Election"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ballot" ADD CONSTRAINT "Ballot_electionId_fkey" FOREIGN KEY ("electionId") REFERENCES "Election"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vote" ADD CONSTRAINT "Vote_ballotId_fkey" FOREIGN KEY ("ballotId") REFERENCES "Ballot"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ProgrammeToVoterRoll" ADD CONSTRAINT "_ProgrammeToVoterRoll_A_fkey" FOREIGN KEY ("A") REFERENCES "Programme"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ProgrammeToVoterRoll" ADD CONSTRAINT "_ProgrammeToVoterRoll_B_fkey" FOREIGN KEY ("B") REFERENCES "voter_roll"("id") ON DELETE CASCADE ON UPDATE CASCADE;
