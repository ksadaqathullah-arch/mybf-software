import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const FOUNDING_CHAPTERS = [
  { code: 'CHP-01-MANJERI', name: 'Manjeri Chapter', slug: 'manjeri' },
  { code: 'CHP-02-MLP-CENTRAL', name: 'Malappuram Central Chapter', slug: 'malappuram-central' },
  { code: 'CHP-03-PERINTHALMANNA', name: 'Perinthalmanna Chapter', slug: 'perinthalmanna' },
  { code: 'CHP-04-TIRUR', name: 'Tirur Chapter', slug: 'tirur' },
  { code: 'CHP-05-KOTTAKKAL', name: 'Kottakkal Chapter', slug: 'kottakkal' },
  { code: 'CHP-06-PONNANI', name: 'Ponnani Chapter', slug: 'ponnani' },
  { code: 'CHP-07-NILAMBUR', name: 'Nilambur Chapter', slug: 'nilambur' },
  { code: 'CHP-08-KONDOTTY', name: 'Kondotty Chapter', slug: 'kondotty' },
  { code: 'CHP-09-PARAPPANANGADI', name: 'Parappanangadi Chapter', slug: 'parappanangadi' },
  { code: 'CHP-10-TANUR', name: 'Tanur Chapter', slug: 'tanur' },
  { code: 'CHP-11-TIRURANGADI', name: 'Tirurangadi Chapter', slug: 'tirurangadi' },
  { code: 'CHP-12-EDAPPAL', name: 'Edappal Chapter', slug: 'edappal' },
  { code: 'CHP-13-VALANCHERY', name: 'Valanchery Chapter', slug: 'valanchery' },
  { code: 'CHP-14-WANDOOR', name: 'Wandoor Chapter', slug: 'wandoor' },
  { code: 'CHP-15-AREACODE', name: 'Areacode Chapter', slug: 'areacode' },
  { code: 'CHP-16-CHANGARAMKULAM', name: 'Changaramkulam Chapter', slug: 'changaramkulam' },
];

export const MALAPPURAM_TALUKS = [
  { code: 'TLK-ERNAD', name: 'Ernad' },
  { code: 'TLK-PERINTHALMANNA', name: 'Perinthalmanna' },
  { code: 'TLK-TIRUR', name: 'Tirur' },
  { code: 'TLK-PONNANI', name: 'Ponnani' },
  { code: 'TLK-NILAMBUR', name: 'Nilambur' },
  { code: 'TLK-TIRURANGADI', name: 'Tirurangadi' },
  { code: 'TLK-KONDOTTY', name: 'Kondotty' },
];

export const MEMBERSHIP_CATEGORIES = [
  {
    code: 'YOUTH_ENTREPRENEUR',
    name: 'Youth Entrepreneur',
    description: 'Aimed at young founders, co-founders and early-stage startup directors under 35.',
    annualFeeINR: 3000,
    minAge: 18,
    maxAge: 35,
  },
  {
    code: 'ESTABLISHED_BIZ',
    name: 'Established Business Owner',
    description: 'For business owners with operational enterprises looking to expand and network.',
    annualFeeINR: 5000,
    minAge: 25,
    maxAge: 65,
  },
  {
    code: 'PROFESSIONAL',
    name: 'Professional Member',
    description: 'Practicing Chartered Accountants, Legal Counsel, Architects, Consultants and Doctors.',
    annualFeeINR: 4000,
    minAge: 21,
    maxAge: 70,
  },
  {
    code: 'STUDENT_INNOVATOR',
    name: 'Student Innovator',
    description: 'Higher education students with innovative prototypes, startup ideas, or research projects.',
    annualFeeINR: 1000,
    minAge: 17,
    maxAge: 26,
  },
];

export const SYSTEM_ROLES = [
  { code: 'SUPER_ADMIN', name: 'Super Administrator', description: 'Complete system control and emergency configuration' },
  { code: 'ORGANIZATION_ADMIN', name: 'Organization Administrator', description: 'Central MYBF leadership and administrative control' },
  { code: 'DISTRICT_ADMIN', name: 'District Administrator', description: 'Malappuram district-wide oversight and analytics' },
  { code: 'CHAPTER_PRESIDENT', name: 'Chapter President', description: 'Chapter executive governance and application approval' },
  { code: 'CHAPTER_SECRETARY', name: 'Chapter Secretary', description: 'Chapter operations, roster, and meeting management' },
  { code: 'CHAPTER_TREASURER', name: 'Chapter Treasurer', description: 'Chapter financial books, receipts and dues monitoring' },
  { code: 'CHAPTER_COORDINATOR', name: 'Chapter Coordinator', description: 'Chapter activities and member engagement' },
  { code: 'MEMBERSHIP_OFFICER', name: 'Membership Officer', description: 'Application review and verification queue manager' },
  { code: 'EVENT_MANAGER', name: 'Event Manager', description: 'Event creation, attendee scanning, and feedback' },
  { code: 'FINANCE_OFFICER', name: 'Finance Officer', description: 'Financial reconciliation, invoices, and payment auditing' },
  { code: 'MEMBER', name: 'Active Member', description: 'Standard authenticated member with directory and event access' },
];

async function main() {
  console.log('Seeding MYBF foundational data...');

  // 1. Seed Organization
  const org = await prisma.organization.upsert({
    where: { code: 'MYBF' },
    update: {},
    create: {
      code: 'MYBF',
      name: 'Malappuram Youth Business Forum',
      slug: 'mybf',
      settings: {
        theme: 'enterprise-navy',
        currency: 'INR',
        initialChapterCount: 16,
      },
    },
  });

  // 2. Seed District
  const district = await prisma.district.upsert({
    where: { code: 'MLP' },
    update: {},
    create: {
      organizationId: org.id,
      code: 'MLP',
      name: 'Malappuram',
      state: 'Kerala',
      country: 'India',
    },
  });

  // 3. Seed 16 Chapters
  for (const ch of FOUNDING_CHAPTERS) {
    await prisma.chapter.upsert({
      where: { code: ch.code },
      update: {},
      create: {
        organizationId: org.id,
        districtId: district.id,
        code: ch.code,
        name: ch.name,
        slug: ch.slug,
        description: `${ch.name} of Malappuram Youth Business Forum.`,
      },
    });
  }

  // 4. Seed Membership Categories
  for (const cat of MEMBERSHIP_CATEGORIES) {
    await prisma.membershipCategory.upsert({
      where: { code: cat.code },
      update: {},
      create: {
        organizationId: org.id,
        code: cat.code,
        name: cat.name,
        description: cat.description,
        annualFeeINR: cat.annualFeeINR,
        minAge: cat.minAge,
        maxAge: cat.maxAge,
      },
    });
  }

  // 5. Seed Roles
  for (const r of SYSTEM_ROLES) {
    await prisma.role.upsert({
      where: { code: r.code },
      update: {},
      create: {
        code: r.code,
        name: r.name,
        description: r.description,
        isSystem: true,
      },
    });
  }

  console.log('Seed completed successfully for 16 chapters, district, categories, and roles.');
}

if (require.main === module) {
  main()
    .catch((e) => {
      console.error(e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
