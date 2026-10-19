import dotenv from 'dotenv';
dotenv.config();

import { PrismaClient } from '@prisma/client';
import {
  VERIFIED_POSTAL_OFFICES,
  UNIQUE_MALAPPURAM_PIN_CODES,
  VERIFIED_LOCAL_BODY_PIN_LINKS,
} from '../src/features/geography/constants/malappuram-postal-dataset';

const prisma = new PrismaClient({
  datasourceUrl: process.env.DATABASE_URL,
});

async function main() {
  console.log('--- MYBF Postal Reference Data Import & Reconciliation ---');

  // 1. Fetch Taluks & Local Bodies from Database
  const [dbTaluks, dbLocalBodies] = await Promise.all([
    prisma.taluk.findMany({ select: { id: true, name: true, code: true } }),
    prisma.localBody.findMany({ select: { id: true, name: true, code: true } }),
  ]);

  console.log(`Found ${dbTaluks.length} Taluks and ${dbLocalBodies.length} Local Bodies in DB.`);

  const talukMap = new Map<string, string>();
  for (const t of dbTaluks) {
    const norm = t.name.toLowerCase().trim();
    talukMap.set(norm, t.id);
    if (norm === 'ernad') talukMap.set('eranad', t.id);
    if (norm === 'eranad') talukMap.set('ernad', t.id);
  }

  const lbMap = new Map<string, string>();
  for (const lb of dbLocalBodies) {
    lbMap.set(lb.name.toLowerCase().trim(), lb.id);
  }

  // 2. Batch Insert PIN Codes
  const existingPins = await prisma.pinCode.findMany({ select: { code: true } });
  const existingPinSet = new Set(existingPins.map((p) => p.code));

  const newPinData = UNIQUE_MALAPPURAM_PIN_CODES
    .filter((pin) => !existingPinSet.has(pin.code))
    .map((pin) => ({
      code: pin.code,
      talukId: talukMap.get(pin.talukName.toLowerCase().trim()) || null,
      postalOfficeName: pin.postalOfficeName,
    }));

  if (newPinData.length > 0) {
    const res = await prisma.pinCode.createMany({
      data: newPinData,
      skipDuplicates: true,
    });
    console.log(`PIN Codes: ${res.count} new inserted (${existingPinSet.size} already existed).`);
  } else {
    console.log(`PIN Codes: All ${existingPinSet.size} PIN codes already present in DB.`);
  }

  // 3. Batch Insert Post Offices
  const existingPOs = await prisma.postOffice.findMany({ select: { code: true } });
  const existingPOSet = new Set(existingPOs.map((po) => po.code));

  const newPOData = VERIFIED_POSTAL_OFFICES
    .filter((po) => !existingPOSet.has(po.code))
    .map((po) => ({
      code: po.code,
      name: po.name,
      pinCode: po.pinCode,
      officeType: po.officeType,
      deliveryStatus: po.deliveryStatus,
      postalDistrict: po.postalDistrict,
      postalDivision: po.postalDivision,
      state: po.state,
      talukId: talukMap.get(po.talukName.toLowerCase().trim()) || null,
      localBodyId: po.localBodyName
        ? lbMap.get(po.localBodyName.toLowerCase().trim()) || null
        : null,
      isVerified: true,
    }));

  if (newPOData.length > 0) {
    const res = await prisma.postOffice.createMany({
      data: newPOData,
      skipDuplicates: true,
    });
    console.log(`Post Offices: ${res.count} new inserted (${existingPOSet.size} already existed).`);
  } else {
    console.log(`Post Offices: All ${existingPOSet.size} post offices already present in DB.`);
  }

  // 4. Batch Insert Verified PIN-Locality Links
  const existingLinks = await prisma.pinLocalityLink.findMany({
    select: { pinCode: true, localBodyId: true },
  });
  const existingLinkSet = new Set(existingLinks.map((l) => `${l.pinCode}::${l.localBodyId}`));

  const newLinkData: Array<{ pinCode: string; localBodyId: string; isVerified: boolean }> = [];
  let skippedLinks = 0;

  for (const link of VERIFIED_LOCAL_BODY_PIN_LINKS) {
    const localBodyId = lbMap.get(link.localBodyName.toLowerCase().trim());
    if (!localBodyId) {
      skippedLinks++;
      continue;
    }
    const key = `${link.pinCode}::${localBodyId}`;
    if (!existingLinkSet.has(key)) {
      newLinkData.push({
        pinCode: link.pinCode,
        localBodyId,
        isVerified: true,
      });
      existingLinkSet.add(key);
    }
  }

  if (newLinkData.length > 0) {
    const res = await prisma.pinLocalityLink.createMany({
      data: newLinkData,
      skipDuplicates: true,
    });
    console.log(`PIN-Locality Links: ${res.count} new inserted (${existingLinks.length} already existed).`);
  } else {
    console.log(`PIN-Locality Links: All ${existingLinks.length} links already present in DB.`);
  }

  // 5. Audit Final Database Counts
  const [totalPins, totalPOs, totalLinks] = await Promise.all([
    prisma.pinCode.count(),
    prisma.postOffice.count(),
    prisma.pinLocalityLink.count(),
  ]);

  console.log('\n--- Final Database Status ---');
  console.log(`Total PIN Codes in DB: ${totalPins}`);
  console.log(`Total Post Offices in DB: ${totalPOs}`);
  console.log(`Total PIN-Locality Links in DB: ${totalLinks}`);
  console.log('Postal import and reconciliation complete successfully!');
}

main()
  .catch((e) => {
    console.error('Import failed with error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
