/*
  Warnings:

  - The values [PUBLISHED,OPEN] on the enum `ElectionStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "ElectionStatus_new" AS ENUM ('DRAFT', 'SCHEDULED', 'ACTIVE', 'COMPLETED', 'CLOSED', 'ARCHIVED', 'CANCELLED');
ALTER TABLE "public"."Election" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Election" ALTER COLUMN "status" TYPE "ElectionStatus_new" USING ("status"::text::"ElectionStatus_new");
ALTER TYPE "ElectionStatus" RENAME TO "ElectionStatus_old";
ALTER TYPE "ElectionStatus_new" RENAME TO "ElectionStatus";
DROP TYPE "public"."ElectionStatus_old";
ALTER TABLE "Election" ALTER COLUMN "status" SET DEFAULT 'DRAFT';
COMMIT;
