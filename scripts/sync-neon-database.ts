import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
dotenv.config();

const dbUrl = process.env.DATABASE_URL || '';
console.log('Connecting to database...');
console.log('Host target:', dbUrl.includes('neon.tech') ? 'Neon Cloud PostgreSQL' : dbUrl.includes('localhost') ? 'Localhost' : 'Other');

if (dbUrl.includes('localhost') || dbUrl.includes('127.0.0.1')) {
  console.error('\n[ERROR] DATABASE_URL in .env is still set to localhost. Please paste your Neon connection string into .env first.');
  process.exit(1);
}

const prisma = new PrismaClient();

async function main() {
  // 1. Verify connection
  await prisma.$queryRaw`SELECT 1`;
  console.log('✓ Successfully connected to PostgreSQL database.');

  // 2. Ensure Organization exists
  const org = await prisma.organization.upsert({
    where: { code: 'MYBF' },
    update: {},
    create: {
      code: 'MYBF',
      name: 'Malappuram Youth Business Forum',
      slug: 'malappuram-youth-business-forum',
      isActive: true,
    },
  });
  console.log('✓ Organization verified:', org.name);

  // 3. Ensure District exists
  const district = await prisma.district.upsert({
    where: { code: 'DIST-MALAPPURAM' },
    update: {},
    create: {
      organizationId: org.id,
      code: 'DIST-MALAPPURAM',
      name: 'Malappuram District',
      isActive: true,
    },
  });
  console.log('✓ District verified:', district.name);

  // 4. Ensure Manjeri Chapter exists
  const manjeriChapter = await prisma.chapter.upsert({
    where: { code: 'CHP-05-MANJERI' },
    update: {},
    create: {
      organizationId: org.id,
      districtId: district.id,
      code: 'CHP-05-MANJERI',
      name: 'Manjeri Chapter',
      slug: 'manjeri',
      description: 'Manjeri Chapter of Malappuram Youth Business Forum.',
      status: 'ACTIVE',
    },
  });
  console.log('✓ Chapter verified:', manjeriChapter.name);

  // 5. Ensure System Roles exist
  const superAdminRole = await prisma.role.upsert({
    where: { code: 'SUPER_ADMIN' },
    update: {},
    create: {
      code: 'SUPER_ADMIN',
      name: 'Super Administrator',
      description: 'Complete system control and emergency configuration',
      isSystem: true,
    },
  });

  const districtAdminRole = await prisma.role.upsert({
    where: { code: 'DISTRICT_ADMIN' },
    update: {},
    create: {
      code: 'DISTRICT_ADMIN',
      name: 'District Administrator',
      description: 'Malappuram district-wide oversight and analytics',
      isSystem: true,
    },
  });

  const memberRole = await prisma.role.upsert({
    where: { code: 'MEMBER' },
    update: {},
    create: {
      code: 'MEMBER',
      name: 'Active Member',
      description: 'Standard authenticated member with directory and event access',
      isSystem: true,
    },
  });
  console.log('✓ System Roles verified: SUPER_ADMIN, DISTRICT_ADMIN, MEMBER');

  // 6. Ensure Super Admin User exists
  const user = await prisma.user.upsert({
    where: { email: 'ksadaqathullah@gmail.com' },
    update: {
      status: 'ACTIVE',
      passwordHash: 'scrypt$4ecc1f814347a9fa31eaa6d4424d88a4$c3900ea05f96da7ca0169ecad42efb6731a23cd88a0d3698cc6fdec9a2065364924cc21627be7ac25b52d7f0569f5d07ddff735cdee846f7122f70efdbe8d547',
      username: 'ksadaqathullah',
      phone: '9495478699',
    },
    create: {
      id: '4af15289-4250-4eee-873d-a4d75e0d2c69',
      email: 'ksadaqathullah@gmail.com',
      username: 'ksadaqathullah',
      phone: '9495478699',
      passwordHash: 'scrypt$4ecc1f814347a9fa31eaa6d4424d88a4$c3900ea05f96da7ca0169ecad42efb6731a23cd88a0d3698cc6fdec9a2065364924cc21627be7ac25b52d7f0569f5d07ddff735cdee846f7122f70efdbe8d547',
      status: 'ACTIVE',
      emailVerified: new Date(),
      phoneVerified: new Date(),
    },
  });

  // 7. Profile
  await prisma.memberProfile.upsert({
    where: { userId: user.id },
    update: {},
    create: {
      userId: user.id,
      organizationId: org.id,
      chapterId: manjeriChapter.id,
      fullName: 'Sadaqathullah K',
      primaryPhone: '9495478699',
      email: 'ksadaqathullah@gmail.com',
      memberCategory: 'STUDENT',
      currentPosition: 'STUDENT',
      occupation: 'founder',
      companyName: 'fleetmanagment',
      businessSector: 'Information Technology',
      isStudent: true,
      taluk: 'Kondotty',
      district: 'Malappuram',
      pinCode: '673638',
      ward: '4',
    },
  });

  // 8. Assign Roles
  const rolesToAssign = [superAdminRole.id, districtAdminRole.id, memberRole.id];
  for (const roleId of rolesToAssign) {
    const existing = await prisma.userRoleAssignment.findFirst({
      where: { userId: user.id, roleId },
    });
    if (!existing) {
      await prisma.userRoleAssignment.create({
        data: {
          userId: user.id,
          roleId,
          organizationId: org.id,
          chapterId: roleId === memberRole.id ? manjeriChapter.id : null,
        },
      });
    }
  }

  console.log(`\n🎉 Super Admin account ksadaqathullah@gmail.com successfully synchronized into Neon!`);
  console.log(`Username: ksadaqathullah`);
  console.log(`Status: ACTIVE`);
  console.log(`Assigned Roles: SUPER_ADMIN, DISTRICT_ADMIN, MEMBER`);
}

main()
  .catch((e) => {
    console.error('Sync failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
