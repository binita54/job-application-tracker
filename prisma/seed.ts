import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  await prisma.application.createMany({
    data: [
      {
        companyName: 'InternSathi',
        jobTitle: 'Full Stack Intern',
        jobType: 'Internship',
        status: 'Interviewing',
        appliedDate: new Date('2026-06-15'),
        notes: 'Assignment submitted before deadline.'
      },
      {
        companyName: 'CloudBridge Labs',
        jobTitle: 'Junior Backend Developer',
        jobType: 'FullTime',
        status: 'Applied',
        appliedDate: new Date('2026-06-12')
      },
      {
        companyName: 'Pixel Desk',
        jobTitle: 'Frontend Assistant',
        jobType: 'PartTime',
        status: 'Offer',
        appliedDate: new Date('2026-06-01'),
        notes: 'Waiting for final compensation details.'
      }
    ],
    skipDuplicates: true
  });
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
