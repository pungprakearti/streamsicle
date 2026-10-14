-- CreateEnum
CREATE TYPE "Availability" AS ENUM ('STREAM', 'RENT', 'BUY');

-- AlterTable: add availability column
ALTER TABLE "title_services" ADD COLUMN "availability" "Availability" NOT NULL DEFAULT 'STREAM';

-- Change primary key to include availability
ALTER TABLE "title_services" DROP CONSTRAINT "title_services_pkey";
ALTER TABLE "title_services" ADD CONSTRAINT "title_services_pkey" PRIMARY KEY ("title_id", "service_id", "availability");
