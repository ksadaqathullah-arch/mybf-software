import { PrismaClient } from '@prisma/client';
import { INITIAL_16_CHAPTERS } from '../src/features/chapters/constants/founding-chapters';

const prisma = new PrismaClient();

// Stable mapping from existing chapter slugs to new constituency chapter slugs
const SLUG_MAPPING: Record<string, string> = {
  'kondotty': 'kondotty',
  'areacode': 'eranad',
  'nilambur': 'nilambur',
  'wandoor': 'wandoor',
  'manjeri': 'manjeri',
  'perinthalmanna': 'perinthalmanna',
  'changaramkulam': 'mankada',
  'malappuram-central': 'malappuram',
  'valanchery': 'vengara',
  'parappanangadi': 'vallikkunnu',
  'tirurangadi': 'tirurangadi',
  'tanur': 'tanur',
  'tirur': 'tirur',
  'kottakkal': 'kottakkal',
  'edappal': 'thavanur',
  'ponnani': 'ponnani',
};

async function main() {
  console.log('--- Starting Safe 16-Constituency Chapter Synchronization ---');

  const existingChapters = await prisma.chapter.findMany();
  console.log(`Found ${existingChapters.length} existing chapter records in database.`);

  await prisma.$transaction(async (tx) => {
    // Step 1: Temporarily namespace unique fields to prevent collision during swap
    for (const ch of existingChapters) {
      await tx.chapter.update({
        where: { id: ch.id },
        data: {
          code: `TMP-${ch.id.slice(0, 8)}`,
          slug: `tmp-${ch.id.slice(0, 8)}`,
        },
      });
    }

    // Step 2: Update existing chapters according to SLUG_MAPPING, or upsert new ones
    for (const targetMeta of INITIAL_16_CHAPTERS) {
      // Find matching existing record via mapping
      const oldSlugMatch = Object.entries(SLUG_MAPPING).find(
        ([, newSlug]) => newSlug === targetMeta.slug
      );
      const oldSlug = oldSlugMatch ? oldSlugMatch[0] : null;
      const matchedRecord = existingChapters.find((ch) => ch.slug === oldSlug);

      if (matchedRecord) {
        console.log(`Updating chapter [${matchedRecord.name}] -> [${targetMeta.name}] (code: ${targetMeta.code}, slug: ${targetMeta.slug})`);
        await tx.chapter.update({
          where: { id: matchedRecord.id },
          data: {
            code: targetMeta.code,
            name: targetMeta.name,
            slug: targetMeta.slug,
            description: `${targetMeta.name} of Malappuram Youth Business Forum. ${targetMeta.description}`,
            status: 'ACTIVE',
          },
        });
      } else {
        console.log(`Inserting new chapter [${targetMeta.name}]`);
        const org = await tx.organization.findFirst();
        const district = await tx.district.findFirst();

        if (!org || !district) {
          throw new Error('Organization or District record missing for chapter creation.');
        }

        await tx.chapter.create({
          data: {
            organizationId: org.id,
            districtId: district.id,
            code: targetMeta.code,
            name: targetMeta.name,
            slug: targetMeta.slug,
            description: `${targetMeta.name} of Malappuram Youth Business Forum. ${targetMeta.description}`,
            status: 'ACTIVE',
          },
        });
      }
    }
  }, { maxWait: 20000, timeout: 90000 });

  const finalChapters = await prisma.chapter.findMany({
    orderBy: { code: 'asc' },
  });

  console.log(`\nSuccessfully synchronized ${finalChapters.length} constituency chapters:`);
  finalChapters.forEach((ch, idx) => {
    console.log(` ${idx + 1}. ${ch.code} - ${ch.name} (slug: ${ch.slug})`);
  });

  await prisma.$disconnect();
}

main().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
