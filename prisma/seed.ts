import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const FOUNDING_CHAPTERS = [
  { code: 'CHP-01-KONDOTTY', name: 'Kondotty Chapter', slug: 'kondotty' },
  { code: 'CHP-02-ERANAD', name: 'Eranad Chapter', slug: 'eranad' },
  { code: 'CHP-03-NILAMBUR', name: 'Nilambur Chapter', slug: 'nilambur' },
  { code: 'CHP-04-WANDOOR', name: 'Wandoor Chapter', slug: 'wandoor' },
  { code: 'CHP-05-MANJERI', name: 'Manjeri Chapter', slug: 'manjeri' },
  { code: 'CHP-06-PERINTHALMANNA', name: 'Perinthalmanna Chapter', slug: 'perinthalmanna' },
  { code: 'CHP-07-MANKADA', name: 'Mankada Chapter', slug: 'mankada' },
  { code: 'CHP-08-MALAPPURAM', name: 'Malappuram Chapter', slug: 'malappuram' },
  { code: 'CHP-09-VENGARA', name: 'Vengara Chapter', slug: 'vengara' },
  { code: 'CHP-10-VALLIKKUNNU', name: 'Vallikkunnu Chapter', slug: 'vallikkunnu' },
  { code: 'CHP-11-TIRURANGADI', name: 'Tirurangadi Chapter', slug: 'tirurangadi' },
  { code: 'CHP-12-TANUR', name: 'Tanur Chapter', slug: 'tanur' },
  { code: 'CHP-13-TIRUR', name: 'Tirur Chapter', slug: 'tirur' },
  { code: 'CHP-14-KOTTAKKAL', name: 'Kottakkal Chapter', slug: 'kottakkal' },
  { code: 'CHP-15-THAVANUR', name: 'Thavanur Chapter', slug: 'thavanur' },
  { code: 'CHP-16-PONNANI', name: 'Ponnani Chapter', slug: 'ponnani' },
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
    annualFeeINR: 0,
    minAge: 18,
    maxAge: 35,
  },
  {
    code: 'ESTABLISHED_BIZ',
    name: 'Established Business Owner',
    description: 'For business owners with operational enterprises looking to expand and network.',
    annualFeeINR: 0,
    minAge: 25,
    maxAge: 65,
  },
  {
    code: 'PROFESSIONAL',
    name: 'Professional Member',
    description: 'Practicing Chartered Accountants, Legal Counsel, Architects, Consultants and Doctors.',
    annualFeeINR: 0,
    minAge: 21,
    maxAge: 70,
  },
  {
    code: 'STUDENT_INNOVATOR',
    name: 'Student Innovator',
    description: 'Higher education students with innovative prototypes, startup ideas, or research projects.',
    annualFeeINR: 0,
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
    const existing = await prisma.chapter.findFirst({
      where: {
        OR: [{ code: ch.code }, { slug: ch.slug }],
      },
    });

    if (existing) {
      await prisma.chapter.update({
        where: { id: existing.id },
        data: {
          code: ch.code,
          name: ch.name,
          slug: ch.slug,
          description: `${ch.name} of Malappuram Youth Business Forum.`,
        },
      });
    } else {
      await prisma.chapter.create({
        data: {
          organizationId: org.id,
          districtId: district.id,
          code: ch.code,
          name: ch.name,
          slug: ch.slug,
          description: `${ch.name} of Malappuram Youth Business Forum.`,
        },
      });
    }
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
