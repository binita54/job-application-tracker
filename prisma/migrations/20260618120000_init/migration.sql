CREATE TYPE "JobType" AS ENUM ('Internship', 'FullTime', 'PartTime');
CREATE TYPE "ApplicationStatus" AS ENUM ('Applied', 'Interviewing', 'Offer', 'Rejected');

CREATE TABLE "applications" (
    "id" TEXT NOT NULL,
    "company_name" TEXT NOT NULL,
    "job_title" TEXT NOT NULL,
    "job_type" "JobType" NOT NULL,
    "status" "ApplicationStatus" NOT NULL DEFAULT 'Applied',
    "applied_date" DATE NOT NULL,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "applications_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "applications_status_idx" ON "applications"("status");
CREATE INDEX "applications_company_name_idx" ON "applications"("company_name");
CREATE INDEX "applications_job_title_idx" ON "applications"("job_title");
