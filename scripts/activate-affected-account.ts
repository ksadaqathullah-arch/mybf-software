import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';
import { MembershipService } from '../src/features/memberships/server/membership.service';
import type { AuthActor } from '../src/server/auth/types';

const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.findFirst({
    where: { email: 'ksadaqathullah@gmail.com' },
    include: {
      membershipApplications: { orderBy: { submittedAt: 'desc' } },
      profile: true,
    },
  });

  if (!user) {
    console.error('User not found.');
    return;
  }

  const app = user.membershipApplications[0];
  console.log(`Processing application ${app.id} (Status: ${app.status}) for ${user.email}...`);

  let activationToken: string | null = null;

  if (app.status === 'SUBMITTED' || app.status === 'UNDER_REVIEW') {
    // 1. Review and approve application through official MembershipService
    const chapterOfficerActor: AuthActor = {
      userId: 'system-kondotty-president',
      email: 'president.kondotty@mybf.in',
      phone: '9847000005',
      status: 'ACTIVE',
      roles: ['CHAPTER_PRESIDENT'],
      chapterId: app.chapterId,
      organizationId: app.organizationId,
    };

    const reviewResult = await MembershipService.reviewApplication(chapterOfficerActor, {
      applicationId: app.id,
      action: 'APPROVE',
      notes: 'Approved by Kondotty Chapter Executive Committee',
    });

    console.log(`Approved! Permanent Member ID: ${reviewResult.membershipNumber}`);
    activationToken = reviewResult.activationToken || null;
  } else if (app.status === 'APPROVED') {
    const payload = (app.payloadJson as Record<string, any>) || {};
    // If token already generated in payload but not consumed, re-issue a fresh activation token
    const rawActivationToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(rawActivationToken).digest('hex');
    const activationExpiresAt = new Date(Date.now() + 72 * 60 * 60 * 1000);

    const updatedPayload = {
      ...payload,
      activation: {
        tokenHash,
        expiresAt: activationExpiresAt.toISOString(),
        createdAt: new Date().toISOString(),
        usedAt: null,
      },
    };

    await prisma.membershipApplication.update({
      where: { id: app.id },
      data: { payloadJson: updatedPayload },
    });

    activationToken = rawActivationToken;
  }

  if (!activationToken) {
    throw new Error('Could not obtain activation token.');
  }

  // 2. Complete account activation via official activateAccount
  console.log('Activating account with username ksadaqathullah and password 1234567890...');
  const activationResult = await MembershipService.activateAccount({
    token: activationToken,
    username: 'ksadaqathullah',
    password: '1234567890',
    confirmPassword: '1234567890',
  });

  console.log('Activation completed successfully:', activationResult);

  // 3. Verify target user
  const updatedUser = await prisma.user.findUnique({
    where: { id: user.id },
    include: {
      profile: {
        include: {
          memberships: {
            include: { idCards: true, chapter: true },
          },
        },
      },
      roleAssignments: { include: { role: true } },
    },
  });

  console.log('--- USER ACCOUNT STATUS ---');
  console.log('Email:', updatedUser?.email);
  console.log('Phone:', updatedUser?.phone);
  console.log('Status:', updatedUser?.status);
  console.log('Password hash present:', Boolean(updatedUser?.passwordHash));
  console.log('Roles:', updatedUser?.roleAssignments.map((ra) => ra.role.code));
  console.log('Member Number:', updatedUser?.profile?.memberships[0]?.membershipNumber);
  console.log('Chapter:', updatedUser?.profile?.memberships[0]?.chapter?.name);
  console.log('Card verification token present:', Boolean(updatedUser?.profile?.memberships[0]?.idCards[0]?.verificationToken));
}

main()
  .then(() => prisma.$disconnect())
  .catch((err) => {
    console.error('Error activating account:', err);
    process.exit(1);
  });
