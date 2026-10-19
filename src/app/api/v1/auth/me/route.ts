import { NextRequest, NextResponse } from 'next/server';
import { getCurrentActor } from '@/server/auth/session';
import { db } from '@/server/db';

export async function GET(request: NextRequest) {
  const actor = await getCurrentActor();
  if (!actor) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  const user = await db.user.findUnique({
    where: { id: actor.userId },
    include: {
      profile: {
        include: {
          chapter: true,
          expectations: true,
          talents: true,
          participationPreferences: true,
          memberships: {
            where: { status: 'ACTIVE' },
            include: {
              idCards: {
                where: { status: 'ACTIVE' },
                orderBy: { cardVersion: 'desc' },
                take: 1,
              },
            },
            take: 1,
          },
        },
      },
    },
  });

  if (!user || !user.profile) {
    return NextResponse.json({ authenticated: true, user: { id: actor.userId, email: actor.email, roles: actor.roles } });
  }

  const profile = user.profile;
  const activeMembership = profile.memberships[0];
  const activeCard = activeMembership?.idCards[0];

  return NextResponse.json({
    authenticated: true,
    user: {
      id: user.id,
      email: user.email,
      phone: user.phone,
      roles: actor.roles,
    },
    profile: {
      id: profile.id,
      fullName: profile.fullName,
      photoUrl: profile.photoUrl,
      dateOfBirth: profile.dateOfBirth?.toISOString().split('T')[0] ?? null,
      gender: profile.gender,
      primaryPhone: profile.primaryPhone,
      email: profile.email,
      memberCategory: profile.memberCategory,
      currentPosition: profile.currentPosition,
      occupation: profile.occupation,
      companyName: profile.companyName,
      businessSector: profile.businessSector,
      taluk: profile.taluk,
      district: profile.district,
      addressLine: profile.addressLine,
      ward: profile.ward,
      pinCode: profile.pinCode,
      futureGoal: profile.futureGoal,
      chapter: {
        id: profile.chapter.id,
        name: profile.chapter.name,
        slug: profile.chapter.slug,
      },
      expectations: profile.expectations.map((e) => e.expectationKey),
      talents: profile.talents.map((t) => t.talentKey),
      participationPreferences: profile.participationPreferences.map((p) => p.preferenceKey),
    },
    membership: activeMembership
      ? {
          membershipNumber: activeMembership.membershipNumber,
          status: activeMembership.status,
          validUntil: activeMembership.validUntil.toISOString(),
          card: activeCard
            ? {
                verificationToken: activeCard.verificationToken,
                cardVersion: activeCard.cardVersion,
                expiresAt: activeCard.expiresAt.toISOString(),
              }
            : null,
        }
      : null,
  });
}
