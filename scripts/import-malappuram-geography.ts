import { PrismaClient, LocalBodyType } from '@prisma/client';
import dotenv from 'dotenv';
dotenv.config();

import {
  VERIFIED_TALUKS,
  ALL_RESIDENTIAL_LOCAL_BODIES,
  getRawWorkbookRows,
} from '../src/features/geography/constants/malappuram-master-dataset';

const prisma = new PrismaClient();

export interface LocationImportSummary {
  rowsProcessed: number;
  newTaluks: number;
  existingTaluksMatched: number;
  newLocalBodies: number;
  existingLocalBodiesMatched: number;
  duplicateCandidates: Array<{
    name: string;
    taluk: string;
    reason: string;
  }>;
  conflicts: Array<{
    name: string;
    reason: string;
  }>;
  unverifiedRecords: Array<{
    name: string;
    reason: string;
  }>;
  importErrors: string[];
}

export async function runGeographyImport(): Promise<LocationImportSummary> {
  const summary: LocationImportSummary = {
    rowsProcessed: 0,
    newTaluks: 0,
    existingTaluksMatched: 0,
    newLocalBodies: 0,
    existingLocalBodiesMatched: 0,
    duplicateCandidates: [],
    conflicts: [],
    unverifiedRecords: [],
    importErrors: [],
  };

  try {
    // 1. Resolve Malappuram District
    const district = await prisma.district.findFirst({
      where: {
        OR: [
          { code: 'DIST-MALAPPURAM' },
          { code: 'MLP' },
          { name: { contains: 'Malappuram', mode: 'insensitive' } },
        ],
      },
    });

    if (!district) {
      throw new Error('Active District for Malappuram not found in database.');
    }

    const rawRows = getRawWorkbookRows();
    summary.rowsProcessed = rawRows.length;

    // Detect duplicate candidates in raw workbook
    const dupCandidates = rawRows.filter((r) => r.isDuplicateCandidate);
    dupCandidates.forEach((d) => {
      summary.duplicateCandidates.push({
        name: d.localBodyName,
        taluk: d.talukCoverage,
        reason: d.notes,
      });
    });

    // 2. Fetch existing taluks in ONE roundtrip
    const existingTaluks = await prisma.taluk.findMany({
      where: { districtId: district.id },
    });
    const existingTalukCodeMap = new Map(existingTaluks.map((t) => [t.code, t]));

    const taluksToCreate = [];
    for (const t of VERIFIED_TALUKS) {
      const match = existingTalukCodeMap.get(t.code);
      if (match) {
        summary.existingTaluksMatched++;
      } else {
        taluksToCreate.push({
          districtId: district.id,
          code: t.code,
          name: t.name,
        });
      }
    }

    if (taluksToCreate.length > 0) {
      await prisma.taluk.createMany({
        data: taluksToCreate,
        skipDuplicates: true,
      });
      summary.newTaluks += taluksToCreate.length;
    }

    // Refresh taluks map
    const allTaluks = await prisma.taluk.findMany({
      where: { districtId: district.id },
    });
    const talukIdMap = new Map<string, string>();
    allTaluks.forEach((t) => {
      talukIdMap.set(t.name.toLowerCase(), t.id);
      talukIdMap.set(t.code.toLowerCase(), t.id);
    });

    // Support alternate spelling 'Ernad' <-> 'Eranad'
    const ernadId = talukIdMap.get('ernad');
    if (ernadId) {
      talukIdMap.set('eranad', ernadId);
    }

    // 3. Fetch existing local bodies in ONE roundtrip
    const existingLocalBodies = await prisma.localBody.findMany({
      where: { districtId: district.id },
    });
    const existingLBCodeMap = new Map(existingLocalBodies.map((lb) => [lb.code, lb]));

    const localBodiesToCreate = [];
    for (const lb of ALL_RESIDENTIAL_LOCAL_BODIES) {
      const talukId = talukIdMap.get(lb.talukName.toLowerCase());
      if (!talukId) {
        summary.importErrors.push(`Taluk ${lb.talukName} not found for ${lb.name}`);
        continue;
      }

      const match = existingLBCodeMap.get(lb.code);
      if (match) {
        summary.existingLocalBodiesMatched++;
      } else {
        localBodiesToCreate.push({
          districtId: district.id,
          talukId,
          code: lb.code,
          name: lb.name,
          type: lb.type as LocalBodyType,
        });
      }
    }

    if (localBodiesToCreate.length > 0) {
      await prisma.localBody.createMany({
        data: localBodiesToCreate,
        skipDuplicates: true,
      });
      summary.newLocalBodies += localBodiesToCreate.length;
    }
  } catch (err: any) {
    summary.importErrors.push(err.message || String(err));
  }

  return summary;
}

async function main() {
  console.log('=== Starting Verified Malappuram Location Import ===');
  const summary = await runGeographyImport();

  console.log('\n--- Location Import Execution Summary ---');
  console.log(`Rows Processed:                ${summary.rowsProcessed}`);
  console.log(`New Taluks Created:            ${summary.newTaluks}`);
  console.log(`Existing Taluks Matched:       ${summary.existingTaluksMatched}`);
  console.log(`New Local Bodies Created:      ${summary.newLocalBodies}`);
  console.log(`Existing Local Bodies Matched: ${summary.existingLocalBodiesMatched}`);
  console.log(`Duplicate Candidates Detected: ${summary.duplicateCandidates.length}`);
  summary.duplicateCandidates.forEach((d) => console.log(`  - ${d.name} (${d.taluk}): ${d.reason}`));
  console.log(`Conflicts:                     ${summary.conflicts.length}`);
  console.log(`Unverified Records Created:    ${summary.unverifiedRecords.length}`);
  console.log(`Import Errors:                 ${summary.importErrors.length}`);

  if (summary.importErrors.length > 0) {
    console.error('Errors encountered:', summary.importErrors);
    process.exit(1);
  }

  const finalCounts = {
    taluks: await prisma.taluk.count(),
    localBodies: await prisma.localBody.count(),
    municipalities: await prisma.localBody.count({ where: { type: 'MUNICIPALITY' } }),
    gramaPanchayats: await prisma.localBody.count({ where: { type: 'GRAMA_PANCHAYAT' } }),
  };

  console.log('\n--- Verified Database State ---');
  console.log(finalCounts);

  await prisma.$disconnect();
}

if (require.main === module) {
  main().catch((e) => {
    console.error(e);
    process.exit(1);
  });
}
