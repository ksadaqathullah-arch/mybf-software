import 'server-only';
import crypto from 'crypto';
import { db } from '@/server/db';
import { assertAuthorized } from '@/server/auth/policy';
import { NotificationService } from '@/features/notifications/server/notification.service';
import type { AuthActor } from '@/server/auth/types';
import type {
  MemberCategory,
  CurrentPosition,
  TransferStatus,
  CorrectionRequestStatus,
  Prisma,
} from '@prisma/client';

export class MemberIdentityService {
  /**
   * Cryptographic hash helper for OTPs and verification tokens
   */
  private static hashToken(token: string): string {
    return crypto.createHash('sha256').update(token.trim()).digest('hex');
  }

  /**
   * Helper to mask a phone number (e.g. +91 98****1234)
   */
  static maskPhone(phone: string | null | undefined): string {
    if (!phone) return 'Not registered';
    const clean = phone.replace(/\D/g, '');
    if (clean.length === 10) {
      return `+91 ${clean.slice(0, 2)}****${clean.slice(6)}`;
    }
    return phone.replace(/(.{2})(.*)(.{3})/, '$1****$3');
  }

  /**
   * Helper to mask an email (e.g. s****@gmail.com)
   */
  static maskEmail(email: string | null | undefined): string {
    if (!email) return 'Not registered';
    const [user, domain] = email.split('@');
    if (!domain) return email;
    const maskedUser = user.length <= 2 ? `${user[0]}*` : `${user.slice(0, 2)}****${user.slice(-1)}`;
    return `${maskedUser}@${domain}`;
  }

  /**
   * 1. GET FULL MEMBER PROFILE & GOVERNANCE STATE
   */
  static async getMemberCompleteProfile(actor: AuthActor) {
    if (!actor || actor.status !== 'ACTIVE') {
      throw new Error('Unauthorized: Active authentication required.');
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
            correctionRequests: {
              orderBy: { createdAt: 'desc' },
              take: 10,
            },
            transfers: {
              include: {
                fromChapter: { select: { id: true, name: true, code: true, slug: true } },
                toChapter: { select: { id: true, name: true, code: true, slug: true } },
              },
              orderBy: { requestedAt: 'desc' },
              take: 10,
            },
            chapterHistory: {
              include: {
                chapter: { select: { id: true, name: true, code: true } },
              },
              orderBy: { assignedAt: 'desc' },
            },
          },
        },
      },
    });

    if (!user || !user.profile) {
      throw new Error('Member profile not found for authenticated user.');
    }

    const profile = user.profile;
    const activeMembership = profile.memberships[0] || null;
    const activeCard = activeMembership?.idCards[0] || null;

    return {
      user: {
        id: user.id,
        email: user.email,
        phone: user.phone,
        emailVerified: user.emailVerified,
        phoneVerified: user.phoneVerified,
        roles: actor.roles,
        status: user.status,
      },
      profile: {
        id: profile.id,
        fullName: profile.fullName,
        photoUrl: profile.photoUrl,
        dateOfBirth: profile.dateOfBirth ? profile.dateOfBirth.toISOString().split('T')[0] : null,
        gender: profile.gender,
        primaryPhone: profile.primaryPhone,
        alternatePhone: profile.alternatePhone,
        email: profile.email,
        bloodGroup: profile.bloodGroup,
        memberCategory: profile.memberCategory,
        currentPosition: profile.currentPosition,
        occupation: profile.occupation,
        companyName: profile.companyName,
        businessSector: profile.businessSector,
        yearsInBusiness: profile.yearsInBusiness,
        isStudent: profile.isStudent,
        institutionName: profile.institutionName,
        courseName: profile.courseName,
        district: profile.district,
        taluk: profile.taluk,
        addressLine: profile.addressLine,
        ward: profile.ward,
        pinCode: profile.pinCode,
        futureGoal: profile.futureGoal,
        chapter: {
          id: profile.chapter.id,
          name: profile.chapter.name,
          code: profile.chapter.code,
          slug: profile.chapter.slug,
        },
        expectations: profile.expectations.map((e) => e.expectationKey),
        talents: profile.talents.map((t) => t.talentKey),
        participationPreferences: profile.participationPreferences.map((p) => p.preferenceKey),
      },
      membership: activeMembership
        ? {
            id: activeMembership.id,
            membershipNumber: activeMembership.membershipNumber,
            status: activeMembership.status,
            startDate: activeMembership.startDate.toISOString(),
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
      correctionRequests: profile.correctionRequests.map((r) => ({
        id: r.id,
        field: r.field,
        oldValue: r.oldValue,
        requestedValue: r.requestedValue,
        reason: r.reason,
        documentUrl: r.documentUrl,
        status: r.status,
        reviewedAt: r.reviewedAt ? r.reviewedAt.toISOString() : null,
        reviewNotes: r.reviewNotes,
        createdAt: r.createdAt.toISOString(),
      })),
      transfers: profile.transfers.map((t) => ({
        id: t.id,
        fromChapter: t.fromChapter,
        toChapter: t.toChapter,
        status: t.status,
        reason: t.reason,
        currentReviewNotes: t.currentReviewNotes,
        destinationReviewNotes: t.destinationReviewNotes,
        districtReviewNotes: t.districtReviewNotes,
        requestedAt: t.requestedAt.toISOString(),
        currentReviewedAt: t.currentReviewedAt ? t.currentReviewedAt.toISOString() : null,
        destinationReviewedAt: t.destinationReviewedAt ? t.destinationReviewedAt.toISOString() : null,
        districtReviewedAt: t.districtReviewedAt ? t.districtReviewedAt.toISOString() : null,
        completedAt: t.completedAt ? t.completedAt.toISOString() : null,
        rejectionReason: t.rejectionReason,
      })),
      chapterHistory: profile.chapterHistory.map((h) => ({
        id: h.id,
        chapter: h.chapter,
        assignedAt: h.assignedAt.toISOString(),
        endedAt: h.endedAt ? h.endedAt.toISOString() : null,
        reason: h.reason,
      })),
    };
  }

  /**
   * 2. UPDATE EDITABLE PERSONAL DETAILS (Non-sensitive)
   */
  static async updatePersonalDetails(
    actor: AuthActor,
    input: {
      gender?: string;
      alternatePhone?: string | null;
      bloodGroup?: string | null;
      photoUrl?: string | null;
    }
  ) {
    const profile = await db.memberProfile.findUnique({
      where: { userId: actor.userId },
    });

    if (!profile) {
      throw new Error('Member profile not found.');
    }

    assertAuthorized({
      actor,
      action: 'member.update_own',
      resource: 'membership',
      recordOwnerId: profile.userId,
    });

    const updated = await db.memberProfile.update({
      where: { id: profile.id },
      data: {
        gender: input.gender !== undefined ? input.gender : profile.gender,
        alternatePhone: input.alternatePhone !== undefined ? input.alternatePhone : profile.alternatePhone,
        bloodGroup: input.bloodGroup !== undefined ? input.bloodGroup : profile.bloodGroup,
        photoUrl: input.photoUrl !== undefined ? input.photoUrl : profile.photoUrl,
      },
    });

    await db.auditEvent.create({
      data: {
        organizationId: profile.organizationId,
        chapterId: profile.chapterId,
        actorId: actor.userId,
        actorEmail: actor.email,
        action: 'MEMBER_PERSONAL_DETAILS_UPDATED',
        resource: 'MemberProfile',
        resourceId: profile.id,
        diffJson: { updatedFields: input },
      },
    });

    await NotificationService.send({
      userId: profile.userId,
      title: 'Profile Updated',
      message: 'Your personal profile details were updated successfully.',
    });

    return updated;
  }

  /**
   * 3. UPDATE PROFESSIONAL & YOUTH DISCOVERY DETAILS
   */
  static async updateProfessionalDetails(
    actor: AuthActor,
    input: {
      memberCategory?: MemberCategory;
      currentPosition?: CurrentPosition;
      occupation?: string | null;
      companyName?: string | null;
      businessSector?: string | null;
      yearsInBusiness?: number | null;
      isStudent?: boolean;
      institutionName?: string | null;
      courseName?: string | null;
      futureGoal?: string | null;
      expectations?: string[];
      talents?: string[];
      participationPreferences?: string[];
    }
  ) {
    const profile = await db.memberProfile.findUnique({
      where: { userId: actor.userId },
    });

    if (!profile) {
      throw new Error('Member profile not found.');
    }

    assertAuthorized({
      actor,
      action: 'member.update_own',
      resource: 'membership',
      recordOwnerId: profile.userId,
    });

    return await db.$transaction(async (tx) => {
      // 1. Update Profile Fields
      const updatedProfile = await tx.memberProfile.update({
        where: { id: profile.id },
        data: {
          memberCategory: input.memberCategory !== undefined ? input.memberCategory : profile.memberCategory,
          currentPosition: input.currentPosition !== undefined ? input.currentPosition : profile.currentPosition,
          occupation: input.occupation !== undefined ? input.occupation : profile.occupation,
          companyName: input.companyName !== undefined ? input.companyName : profile.companyName,
          businessSector: input.businessSector !== undefined ? input.businessSector : profile.businessSector,
          yearsInBusiness: input.yearsInBusiness !== undefined ? input.yearsInBusiness : profile.yearsInBusiness,
          isStudent: input.isStudent !== undefined ? input.isStudent : profile.isStudent,
          institutionName: input.institutionName !== undefined ? input.institutionName : profile.institutionName,
          courseName: input.courseName !== undefined ? input.courseName : profile.courseName,
          futureGoal: input.futureGoal !== undefined ? input.futureGoal : profile.futureGoal,
        },
      });

      // 2. Synchronize expectations, talents, preferences if provided
      if (input.expectations !== undefined) {
        await tx.memberExpectation.deleteMany({ where: { memberProfileId: profile.id } });
        if (input.expectations.length > 0) {
          await tx.memberExpectation.createMany({
            data: input.expectations.map((key) => ({
              memberProfileId: profile.id,
              expectationKey: key,
            })),
          });
        }
      }

      if (input.talents !== undefined) {
        await tx.memberTalent.deleteMany({ where: { memberProfileId: profile.id } });
        if (input.talents.length > 0) {
          await tx.memberTalent.createMany({
            data: input.talents.map((key) => ({
              memberProfileId: profile.id,
              talentKey: key,
              category: 'GENERAL',
            })),
          });
        }
      }

      if (input.participationPreferences !== undefined) {
        await tx.memberParticipationPreference.deleteMany({ where: { memberProfileId: profile.id } });
        if (input.participationPreferences.length > 0) {
          await tx.memberParticipationPreference.createMany({
            data: input.participationPreferences.map((key) => ({
              memberProfileId: profile.id,
              preferenceKey: key,
            })),
          });
        }
      }

      // 3. Audit trail
      await tx.auditEvent.create({
        data: {
          organizationId: profile.organizationId,
          chapterId: profile.chapterId,
          actorId: actor.userId,
          actorEmail: actor.email,
          action: 'MEMBER_PROFESSIONAL_DETAILS_UPDATED',
          resource: 'MemberProfile',
          resourceId: profile.id,
          diffJson: { updatedFields: input },
        },
      });

      await NotificationService.send({
        userId: profile.userId,
        title: 'Professional Details Saved',
        message: 'Your professional and entrepreneurial classification was updated successfully.',
      });

      return updatedProfile;
    });
  }

  /**
   * 4. UPDATE LOCATION DETAILS (Address, Ward, Taluk, PIN Code)
   * Note: Changing location NEVER automatically changes chapter assignment.
   */
  static async updateLocationDetails(
    actor: AuthActor,
    input: {
      district: string;
      taluk: string;
      addressLine?: string | null;
      ward?: string | null;
      pinCode: string;
    }
  ) {
    const profile = await db.memberProfile.findUnique({
      where: { userId: actor.userId },
    });

    if (!profile) {
      throw new Error('Member profile not found.');
    }

    assertAuthorized({
      actor,
      action: 'member.update_own',
      resource: 'membership',
      recordOwnerId: profile.userId,
    });

    const updated = await db.memberProfile.update({
      where: { id: profile.id },
      data: {
        district: input.district || 'Malappuram',
        taluk: input.taluk,
        addressLine: input.addressLine ?? profile.addressLine,
        ward: input.ward ?? profile.ward,
        pinCode: input.pinCode,
      },
    });

    await db.auditEvent.create({
      data: {
        organizationId: profile.organizationId,
        chapterId: profile.chapterId,
        actorId: actor.userId,
        actorEmail: actor.email,
        action: 'MEMBER_LOCATION_DETAILS_UPDATED',
        resource: 'MemberProfile',
        resourceId: profile.id,
        diffJson: {
          previousLocation: { taluk: profile.taluk, pinCode: profile.pinCode },
          newLocation: { taluk: input.taluk, pinCode: input.pinCode },
        },
      },
    });

    await NotificationService.send({
      userId: profile.userId,
      title: 'Location Details Updated',
      message: `Your verified residential location in ${input.taluk} Taluk (PIN ${input.pinCode}) has been updated.`,
    });

    return updated;
  }

  /**
   * 5. PHONE NUMBER CHANGE: REQUEST OTP
   */
  static async requestPhoneChangeOtp(actor: AuthActor, newPhone: string) {
    if (!actor || actor.status !== 'ACTIVE') {
      throw new Error('Unauthorized: Active session required.');
    }

    const cleanNewPhone = newPhone.replace(/\D/g, '');
    if (!/^[6-9]\d{9}$/.test(cleanNewPhone)) {
      throw new Error('Invalid mobile number: Must be a 10-digit Indian mobile number.');
    }

    // Check account uniqueness
    const existingUser = await db.user.findFirst({
      where: {
        phone: cleanNewPhone,
        id: { not: actor.userId },
      },
    });

    if (existingUser) {
      // Do not reveal account ownership details
      throw new Error('This phone number is already registered or unavailable.');
    }

    // Rate limiting: Check active challenges in the last 15 minutes
    const recentChallengesCount = await db.contactVerificationChallenge.count({
      where: {
        userId: actor.userId,
        contactType: 'PHONE',
        createdAt: { gte: new Date(Date.now() - 15 * 60 * 1000) },
      },
    });

    if (recentChallengesCount >= 5) {
      throw new Error('Rate limit exceeded: Too many verification attempts. Please wait 15 minutes.');
    }

    // Cooldown check for existing unverified challenge
    const latestChallenge = await db.contactVerificationChallenge.findFirst({
      where: { userId: actor.userId, contactType: 'PHONE', isVerified: false },
      orderBy: { createdAt: 'desc' },
    });

    if (latestChallenge && latestChallenge.resendAfter > new Date()) {
      const waitSeconds = Math.ceil((latestChallenge.resendAfter.getTime() - Date.now()) / 1000);
      throw new Error(`Please wait ${waitSeconds} seconds before requesting a new OTP.`);
    }

    // Generate high-entropy 6-digit numeric OTP
    const rawOtp = crypto.randomInt(100000, 999999).toString();
    const tokenHash = this.hashToken(rawOtp);
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes validity
    const resendAfter = new Date(Date.now() + 60 * 1000); // 60 seconds cooldown

    // Invalidate prior pending challenges for this user/contactType
    await db.contactVerificationChallenge.deleteMany({
      where: { userId: actor.userId, contactType: 'PHONE', isVerified: false },
    });

    await db.contactVerificationChallenge.create({
      data: {
        userId: actor.userId,
        contactType: 'PHONE',
        currentValue: actor.phone,
        targetValue: cleanNewPhone,
        tokenHash,
        expiresAt,
        resendAfter,
      },
    });

    // Notify previous contact channel if available
    await NotificationService.send({
      userId: actor.userId,
      title: 'Phone Change Verification Initiated',
      message: `A request was received to update your registered mobile number to ${this.maskPhone(cleanNewPhone)}. If this was not you, please contact support.`,
    });

    await db.auditEvent.create({
      data: {
        actorId: actor.userId,
        actorEmail: actor.email,
        action: 'PHONE_CHANGE_OTP_REQUESTED',
        resource: 'User',
        resourceId: actor.userId,
        diffJson: { targetPhone: this.maskPhone(cleanNewPhone) },
      },
    });

    // Return status with development bypass OTP if SMS gateway not configured
    const isLocalDev = process.env.NODE_ENV !== 'production';
    return {
      success: true,
      maskedTarget: this.maskPhone(cleanNewPhone),
      expiresAt: expiresAt.toISOString(),
      resendAfter: resendAfter.toISOString(),
      ...(isLocalDev ? { devOtpNotice: `Dev simulation OTP: ${rawOtp}` } : {}),
    };
  }

  /**
   * 6. PHONE NUMBER CHANGE: VERIFY OTP & ATOMIC UPDATE
   */
  static async verifyPhoneChangeOtp(actor: AuthActor, newPhone: string, otp: string) {
    if (!actor || actor.status !== 'ACTIVE') {
      throw new Error('Unauthorized: Active session required.');
    }

    const cleanNewPhone = newPhone.replace(/\D/g, '');
    const challenge = await db.contactVerificationChallenge.findFirst({
      where: {
        userId: actor.userId,
        contactType: 'PHONE',
        targetValue: cleanNewPhone,
        isVerified: false,
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!challenge) {
      throw new Error('No active verification challenge found. Please request a new OTP.');
    }

    if (challenge.expiresAt < new Date()) {
      throw new Error('The OTP has expired. Please request a new code.');
    }

    if (challenge.attemptsCount >= 5) {
      await db.contactVerificationChallenge.delete({ where: { id: challenge.id } });
      throw new Error('Maximum verification attempts exceeded. Please initiate a new request.');
    }

    const inputHash = this.hashToken(otp);
    if (inputHash !== challenge.tokenHash) {
      await db.contactVerificationChallenge.update({
        where: { id: challenge.id },
        data: { attemptsCount: { increment: 1 } },
      });
      const remaining = 4 - challenge.attemptsCount;
      throw new Error(`Invalid verification code. ${remaining > 0 ? `${remaining} attempt(s) remaining.` : 'Code locked.'}`);
    }

    // Atomic update
    return await db.$transaction(async (tx) => {
      // Mark challenge verified
      await tx.contactVerificationChallenge.update({
        where: { id: challenge.id },
        data: { isVerified: true, verifiedAt: new Date() },
      });

      // Update User phone
      await tx.user.update({
        where: { id: actor.userId },
        data: {
          phone: cleanNewPhone,
          phoneVerified: new Date(),
        },
      });

      // Update MemberProfile primaryPhone
      await tx.memberProfile.update({
        where: { userId: actor.userId },
        data: { primaryPhone: cleanNewPhone },
      });

      // Audit event
      await tx.auditEvent.create({
        data: {
          actorId: actor.userId,
          actorEmail: actor.email,
          action: 'PHONE_NUMBER_VERIFIED_AND_CHANGED',
          resource: 'User',
          resourceId: actor.userId,
          diffJson: {
            oldPhone: this.maskPhone(challenge.currentValue),
            newPhone: this.maskPhone(cleanNewPhone),
          },
        },
      });

      await NotificationService.send({
        userId: actor.userId,
        title: 'Mobile Number Verified & Updated',
        message: `Your MYBF verified mobile number was successfully changed to ${this.maskPhone(cleanNewPhone)}.`,
      });

      return {
        success: true,
        updatedPhone: cleanNewPhone,
      };
    });
  }

  /**
   * 7. EMAIL ADDRESS CHANGE: REQUEST TOKEN
   */
  static async requestEmailChangeVerification(actor: AuthActor, newEmail: string) {
    if (!actor || actor.status !== 'ACTIVE') {
      throw new Error('Unauthorized: Active session required.');
    }

    const cleanEmail = newEmail.trim().toLowerCase();
    const existingUser = await db.user.findFirst({
      where: {
        email: cleanEmail,
        id: { not: actor.userId },
      },
    });

    if (existingUser) {
      throw new Error('This email address is already registered or unavailable.');
    }

    const recentChallengesCount = await db.contactVerificationChallenge.count({
      where: {
        userId: actor.userId,
        contactType: 'EMAIL',
        createdAt: { gte: new Date(Date.now() - 15 * 60 * 1000) },
      },
    });

    if (recentChallengesCount >= 5) {
      throw new Error('Rate limit exceeded: Too many email verification attempts. Please wait 15 minutes.');
    }

    const rawCode = crypto.randomInt(100000, 999999).toString();
    const tokenHash = this.hashToken(rawCode);
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes validity
    const resendAfter = new Date(Date.now() + 60 * 1000); // 60 seconds cooldown

    await db.contactVerificationChallenge.deleteMany({
      where: { userId: actor.userId, contactType: 'EMAIL', isVerified: false },
    });

    await db.contactVerificationChallenge.create({
      data: {
        userId: actor.userId,
        contactType: 'EMAIL',
        currentValue: actor.email,
        targetValue: cleanEmail,
        tokenHash,
        expiresAt,
        resendAfter,
      },
    });

    await NotificationService.send({
      userId: actor.userId,
      title: 'Email Change Verification Initiated',
      message: `A request was made to update your login email to ${this.maskEmail(cleanEmail)}.`,
    });

    await db.auditEvent.create({
      data: {
        actorId: actor.userId,
        actorEmail: actor.email,
        action: 'EMAIL_CHANGE_VERIFICATION_REQUESTED',
        resource: 'User',
        resourceId: actor.userId,
        diffJson: { targetEmail: this.maskEmail(cleanEmail) },
      },
    });

    const isLocalDev = process.env.NODE_ENV !== 'production';
    return {
      success: true,
      maskedTarget: this.maskEmail(cleanEmail),
      expiresAt: expiresAt.toISOString(),
      resendAfter: resendAfter.toISOString(),
      ...(isLocalDev ? { devOtpNotice: `Dev simulation code: ${rawCode}` } : {}),
    };
  }

  /**
   * 8. EMAIL ADDRESS CHANGE: VERIFY TOKEN & ATOMIC UPDATE
   */
  static async verifyEmailChange(actor: AuthActor, newEmail: string, token: string) {
    if (!actor || actor.status !== 'ACTIVE') {
      throw new Error('Unauthorized: Active session required.');
    }

    const cleanEmail = newEmail.trim().toLowerCase();
    const challenge = await db.contactVerificationChallenge.findFirst({
      where: {
        userId: actor.userId,
        contactType: 'EMAIL',
        targetValue: cleanEmail,
        isVerified: false,
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!challenge) {
      throw new Error('No active verification challenge found for this email address.');
    }

    if (challenge.expiresAt < new Date()) {
      throw new Error('The verification code has expired. Please request a new code.');
    }

    if (challenge.attemptsCount >= 5) {
      await db.contactVerificationChallenge.delete({ where: { id: challenge.id } });
      throw new Error('Maximum verification attempts exceeded. Please initiate a new request.');
    }

    const inputHash = this.hashToken(token);
    if (inputHash !== challenge.tokenHash) {
      await db.contactVerificationChallenge.update({
        where: { id: challenge.id },
        data: { attemptsCount: { increment: 1 } },
      });
      const remaining = 4 - challenge.attemptsCount;
      throw new Error(`Invalid verification code. ${remaining > 0 ? `${remaining} attempt(s) remaining.` : 'Code locked.'}`);
    }

    return await db.$transaction(async (tx) => {
      await tx.contactVerificationChallenge.update({
        where: { id: challenge.id },
        data: { isVerified: true, verifiedAt: new Date() },
      });

      await tx.user.update({
        where: { id: actor.userId },
        data: {
          email: cleanEmail,
          emailVerified: new Date(),
        },
      });

      await tx.memberProfile.update({
        where: { userId: actor.userId },
        data: { email: cleanEmail },
      });

      await tx.auditEvent.create({
        data: {
          actorId: actor.userId,
          actorEmail: actor.email,
          action: 'EMAIL_VERIFIED_AND_CHANGED',
          resource: 'User',
          resourceId: actor.userId,
          diffJson: {
            oldEmail: this.maskEmail(challenge.currentValue),
            newEmail: this.maskEmail(cleanEmail),
          },
        },
      });

      await NotificationService.send({
        userId: actor.userId,
        title: 'Login Email Updated',
        message: `Your login email address has been successfully changed to ${cleanEmail}.`,
      });

      return {
        success: true,
        updatedEmail: cleanEmail,
      };
    });
  }

  /**
   * 9. SUBMIT FORMAL IDENTITY CORRECTION REQUEST
   * Controlled workflow for legal full name, date of birth, etc.
   */
  static async submitIdentityCorrectionRequest(
    actor: AuthActor,
    input: {
      field: string;
      requestedValue: string;
      reason: string;
      documentUrl?: string | null;
    }
  ) {
    const profile = await db.memberProfile.findUnique({
      where: { userId: actor.userId },
    });

    if (!profile) {
      throw new Error('Member profile not found.');
    }

    assertAuthorized({
      actor,
      action: 'member.request_correction',
      resource: 'membership',
      recordOwnerId: profile.userId,
    });

    // Validate age eligibility if correcting Date of Birth
    if (input.field === 'dateOfBirth') {
      const parsedDob = new Date(input.requestedValue);
      if (isNaN(parsedDob.getTime())) {
        throw new Error('Invalid Date of Birth format.');
      }
      const ageDiffMs = Date.now() - parsedDob.getTime();
      const ageDate = new Date(ageDiffMs);
      const calculatedAge = Math.abs(ageDate.getUTCFullYear() - 1970);

      if (calculatedAge < 18 || calculatedAge > 40) {
        throw new Error(`Date of Birth change requires MYBF age eligibility (18–40 years). Calculated age: ${calculatedAge}.`);
      }
    }

    // Check existing pending request for same field
    const existingPending = await db.profileCorrectionRequest.findFirst({
      where: {
        memberProfileId: profile.id,
        field: input.field,
        status: 'PENDING',
      },
    });

    if (existingPending) {
      throw new Error(`You already have an active pending correction request for ${input.field}.`);
    }

    const currentOldValue =
      input.field === 'fullName'
        ? profile.fullName
        : input.field === 'dateOfBirth'
        ? profile.dateOfBirth?.toISOString().split('T')[0] ?? null
        : input.field === 'gender'
        ? profile.gender
        : null;

    const request = await db.profileCorrectionRequest.create({
      data: {
        memberProfileId: profile.id,
        field: input.field,
        oldValue: currentOldValue,
        requestedValue: input.requestedValue,
        reason: input.reason,
        documentUrl: input.documentUrl ?? null,
        status: 'PENDING',
      },
    });

    await db.auditEvent.create({
      data: {
        organizationId: profile.organizationId,
        chapterId: profile.chapterId,
        actorId: actor.userId,
        actorEmail: actor.email,
        action: 'IDENTITY_CORRECTION_REQUESTED',
        resource: 'ProfileCorrectionRequest',
        resourceId: request.id,
        diffJson: {
          field: input.field,
          oldValue: currentOldValue,
          requestedValue: input.requestedValue,
          reason: input.reason,
        },
      },
    });

    await NotificationService.send({
      userId: profile.userId,
      title: 'Correction Request Submitted',
      message: `Your request to update ${input.field} is under review by District Administration.`,
    });

    return request;
  }

  /**
   * 10. REVIEW IDENTITY CORRECTION REQUEST (District Admin / Super Admin)
   */
  static async reviewIdentityCorrection(
    actor: AuthActor,
    input: {
      requestId: string;
      decision: 'APPROVE' | 'REJECT' | 'REQUEST_CLARIFICATION';
      reviewNotes: string;
    }
  ) {
    const isDistrictAdmin = actor.roles.includes('DISTRICT_ADMIN');
    const isSuperAdmin = actor.roles.includes('SUPER_ADMIN');

    if (!isDistrictAdmin && !isSuperAdmin) {
      throw new Error('Forbidden: District Administrator credentials required to review identity corrections.');
    }

    const request = await db.profileCorrectionRequest.findUnique({
      where: { id: input.requestId },
      include: {
        memberProfile: {
          include: { user: true, chapter: true },
        },
      },
    });

    if (!request) {
      throw new Error('Correction request not found.');
    }

    if (request.status !== 'PENDING' && request.status !== 'CLARIFICATION_REQUESTED') {
      throw new Error(`Correction request is already in ${request.status} status.`);
    }

    const profile = request.memberProfile;

    return await db.$transaction(async (tx) => {
      let newStatus: CorrectionRequestStatus;
      if (input.decision === 'APPROVE') newStatus = 'APPROVED';
      else if (input.decision === 'REJECT') newStatus = 'REJECTED';
      else newStatus = 'CLARIFICATION_REQUESTED';

      const updatedRequest = await tx.profileCorrectionRequest.update({
        where: { id: request.id },
        data: {
          status: newStatus,
          reviewedById: actor.userId,
          reviewedAt: new Date(),
          reviewNotes: input.reviewNotes,
        },
      });

      // Apply identity change if approved
      if (input.decision === 'APPROVE') {
        const updateData: Prisma.MemberProfileUpdateInput = {};
        if (request.field === 'fullName') {
          updateData.fullName = request.requestedValue;
        } else if (request.field === 'dateOfBirth') {
          updateData.dateOfBirth = new Date(request.requestedValue);
        } else if (request.field === 'gender') {
          updateData.gender = request.requestedValue;
        }

        if (Object.keys(updateData).length > 0) {
          await tx.memberProfile.update({
            where: { id: profile.id },
            data: updateData,
          });
        }
      }

      await tx.auditEvent.create({
        data: {
          organizationId: profile.organizationId,
          chapterId: profile.chapterId,
          actorId: actor.userId,
          actorEmail: actor.email,
          action: `IDENTITY_CORRECTION_${newStatus}`,
          resource: 'ProfileCorrectionRequest',
          resourceId: request.id,
          diffJson: {
            field: request.field,
            decision: input.decision,
            reviewNotes: input.reviewNotes,
          },
        },
      });

      await NotificationService.send({
        userId: profile.userId,
        title: `Identity Correction ${newStatus.replace('_', ' ')}`,
        message:
          input.decision === 'APPROVE'
            ? `Your identity correction for ${request.field} was approved by District Administration.`
            : `Your identity correction for ${request.field} was ${newStatus.toLowerCase().replace('_', ' ')}. Remarks: ${input.reviewNotes}`,
      });

      return updatedRequest;
    });
  }

  /**
   * 11. SUBMIT CHAPTER TRANSFER REQUEST
   */
  static async submitChapterTransfer(
    actor: AuthActor,
    input: { destinationChapterId: string; reason: string }
  ) {
    const profile = await db.memberProfile.findUnique({
      where: { userId: actor.userId },
      include: { chapter: true },
    });

    if (!profile) {
      throw new Error('Member profile not found.');
    }

    assertAuthorized({
      actor,
      action: 'member.transfer_request',
      resource: 'membership',
      recordOwnerId: profile.userId,
    });

    if (profile.chapterId === input.destinationChapterId) {
      throw new Error('Cannot request transfer: You are already assigned to this chapter.');
    }

    const destinationChapter = await db.chapter.findUnique({
      where: { id: input.destinationChapterId },
    });

    if (!destinationChapter || destinationChapter.status !== 'ACTIVE') {
      throw new Error('Destination chapter not found or inactive.');
    }

    // Check duplicate pending transfer
    const activeTransfer = await db.chapterTransfer.findFirst({
      where: {
        memberProfileId: profile.id,
        status: { in: ['REQUESTED', 'CURRENT_APPROVED', 'DESTINATION_APPROVED'] },
      },
    });

    if (activeTransfer) {
      throw new Error('You already have an active chapter transfer request in progress.');
    }

    const transfer = await db.chapterTransfer.create({
      data: {
        memberProfileId: profile.id,
        fromChapterId: profile.chapterId,
        toChapterId: input.destinationChapterId,
        reason: input.reason,
        status: 'REQUESTED',
      },
      include: {
        fromChapter: true,
        toChapter: true,
      },
    });

    await db.auditEvent.create({
      data: {
        organizationId: profile.organizationId,
        chapterId: profile.chapterId,
        actorId: actor.userId,
        actorEmail: actor.email,
        action: 'CHAPTER_TRANSFER_REQUESTED',
        resource: 'ChapterTransfer',
        resourceId: transfer.id,
        diffJson: {
          fromChapter: profile.chapter.name,
          toChapter: destinationChapter.name,
          reason: input.reason,
        },
      },
    });

    await NotificationService.send({
      userId: profile.userId,
      title: 'Transfer Request Submitted',
      message: `Your transfer request from ${profile.chapter.name} to ${destinationChapter.name} has been submitted for executive review.`,
    });

    return transfer;
  }

  /**
   * 12. CHAPTER EXECUTIVE REVIEW (Current or Destination Chapter Recommendation)
   */
  static async reviewChapterTransferRecommendation(
    actor: AuthActor,
    input: {
      transferId: string;
      recommendation: 'RECOMMEND_APPROVAL' | 'RECOMMEND_REJECTION' | 'REQUEST_CLARIFICATION';
      remarks: string;
    }
  ) {
    const transfer = await db.chapterTransfer.findUnique({
      where: { id: input.transferId },
      include: {
        fromChapter: true,
        toChapter: true,
        memberProfile: true,
      },
    });

    if (!transfer) {
      throw new Error('Chapter transfer request not found.');
    }

    if (transfer.status === 'COMPLETED' || transfer.status === 'REJECTED') {
      throw new Error(`Transfer is already finalized (${transfer.status}).`);
    }

    // Verify officer scope
    const isSuperAdmin = actor.roles.includes('SUPER_ADMIN');
    const isDistrictAdmin = actor.roles.includes('DISTRICT_ADMIN');
    const isFromChapterOfficer = actor.chapterId === transfer.fromChapterId;
    const isToChapterOfficer = actor.chapterId === transfer.toChapterId;

    if (!isSuperAdmin && !isDistrictAdmin && !isFromChapterOfficer && !isToChapterOfficer) {
      throw new Error('Forbidden: You are not authorized to review transfers for this chapter.');
    }

    return await db.$transaction(async (tx) => {
      let nextStatus: TransferStatus = transfer.status;
      const now = new Date();
      const updateData: Prisma.ChapterTransferUpdateInput = {};

      if (input.recommendation === 'RECOMMEND_REJECTION') {
        nextStatus = 'REJECTED';
        updateData.status = 'REJECTED';
        updateData.rejectionReason = input.remarks;
        if (isFromChapterOfficer) {
          updateData.currentReviewedAt = now;
          updateData.currentReviewNotes = input.remarks;
        } else if (isToChapterOfficer) {
          updateData.destinationReviewedAt = now;
          updateData.destinationReviewNotes = input.remarks;
        }
      } else if (input.recommendation === 'RECOMMEND_APPROVAL') {
        if (isFromChapterOfficer || (isDistrictAdmin && transfer.status === 'REQUESTED')) {
          nextStatus = 'CURRENT_APPROVED';
          updateData.status = 'CURRENT_APPROVED';
          updateData.currentReviewedAt = now;
          updateData.currentReviewNotes = input.remarks;
        } else if (isToChapterOfficer || (isDistrictAdmin && transfer.status === 'CURRENT_APPROVED')) {
          nextStatus = 'DESTINATION_APPROVED';
          updateData.status = 'DESTINATION_APPROVED';
          updateData.destinationReviewedAt = now;
          updateData.destinationReviewNotes = input.remarks;
        }
      } else {
        // Clarification notes
        if (isFromChapterOfficer) updateData.currentReviewNotes = `[Clarification] ${input.remarks}`;
        if (isToChapterOfficer) updateData.destinationReviewNotes = `[Clarification] ${input.remarks}`;
      }

      const updated = await tx.chapterTransfer.update({
        where: { id: transfer.id },
        data: updateData,
      });

      await tx.auditEvent.create({
        data: {
          chapterId: actor.chapterId || transfer.fromChapterId,
          actorId: actor.userId,
          actorEmail: actor.email,
          action: `CHAPTER_TRANSFER_RECOMMENDATION_${input.recommendation}`,
          resource: 'ChapterTransfer',
          resourceId: transfer.id,
          diffJson: {
            recommendation: input.recommendation,
            remarks: input.remarks,
            statusAfterReview: nextStatus,
          },
        },
      });

      await NotificationService.send({
        userId: transfer.memberProfile.userId,
        title: 'Transfer Review Update',
        message: `Your transfer to ${transfer.toChapter.name} received a review update (${input.recommendation.replace('_', ' ')}). Remarks: ${input.remarks}`,
      });

      return updated;
    });
  }

  /**
   * 13. DISTRICT ADMIN FINAL APPROVAL & ATOMIC CHAPTER ASSIGNMENT
   * Preserves permanent Member ID and historical records intact.
   */
  static async districtAdminFinalizeTransfer(
    actor: AuthActor,
    input: {
      transferId: string;
      decision: 'APPROVE' | 'REJECT' | 'REQUEST_CLARIFICATION';
      remarks: string;
    }
  ) {
    const isDistrictAdmin = actor.roles.includes('DISTRICT_ADMIN');
    const isSuperAdmin = actor.roles.includes('SUPER_ADMIN');

    if (!isDistrictAdmin && !isSuperAdmin) {
      throw new Error('Forbidden: District Administrator credentials required to finalize chapter transfers.');
    }

    const transfer = await db.chapterTransfer.findUnique({
      where: { id: input.transferId },
      include: {
        fromChapter: true,
        toChapter: true,
        memberProfile: {
          include: {
            memberships: { where: { status: 'ACTIVE' } },
          },
        },
      },
    });

    if (!transfer) {
      throw new Error('Chapter transfer request not found.');
    }

    if (transfer.status === 'COMPLETED' || transfer.status === 'REJECTED') {
      throw new Error(`Transfer is already finalized with status: ${transfer.status}.`);
    }

    const profile = transfer.memberProfile;
    const now = new Date();

    return await db.$transaction(async (tx) => {
      if (input.decision === 'REJECT') {
        const rejected = await tx.chapterTransfer.update({
          where: { id: transfer.id },
          data: {
            status: 'REJECTED',
            rejectionReason: input.remarks,
            districtReviewedAt: now,
            districtReviewNotes: input.remarks,
          },
        });

        await tx.auditEvent.create({
          data: {
            organizationId: profile.organizationId,
            chapterId: transfer.fromChapterId,
            actorId: actor.userId,
            actorEmail: actor.email,
            action: 'CHAPTER_TRANSFER_REJECTED_BY_DISTRICT',
            resource: 'ChapterTransfer',
            resourceId: transfer.id,
            diffJson: { decision: 'REJECT', remarks: input.remarks },
          },
        });

        await NotificationService.send({
          userId: profile.userId,
          title: 'Chapter Transfer Rejected',
          message: `Your request to transfer to ${transfer.toChapter.name} was not approved by District Administration. Reason: ${input.remarks}`,
        });

        return rejected;
      }

      if (input.decision === 'REQUEST_CLARIFICATION') {
        const updated = await tx.chapterTransfer.update({
          where: { id: transfer.id },
          data: {
            districtReviewedAt: now,
            districtReviewNotes: `[Clarification Requested] ${input.remarks}`,
          },
        });

        await NotificationService.send({
          userId: profile.userId,
          title: 'Transfer Clarification Requested',
          message: `District Administration has requested clarification regarding your transfer: ${input.remarks}`,
        });

        return updated;
      }

      // APPROVE & EXECUTE ATOMIC TRANSFER
      // 1. Record historical chapter assignment end date
      await tx.memberChapterAssignmentHistory.create({
        data: {
          memberProfileId: profile.id,
          chapterId: transfer.fromChapterId,
          assignedAt: profile.createdAt,
          endedAt: now,
          transferId: transfer.id,
          reason: `Transfer to ${transfer.toChapter.name}: ${transfer.reason}`,
        },
      });

      // 2. Insert new chapter assignment record
      await tx.memberChapterAssignmentHistory.create({
        data: {
          memberProfileId: profile.id,
          chapterId: transfer.toChapterId,
          assignedAt: now,
          transferId: transfer.id,
          reason: `Approved transfer by District Admin (${actor.email})`,
        },
      });

      // 3. Update current chapter assignment in MemberProfile
      await tx.memberProfile.update({
        where: { id: profile.id },
        data: { chapterId: transfer.toChapterId },
      });

      // 4. Update current chapter on active Membership (Permanent Member ID remains UNCHANGED)
      if (profile.memberships.length > 0) {
        await tx.membership.updateMany({
          where: {
            memberProfileId: profile.id,
            status: 'ACTIVE',
          },
          data: { chapterId: transfer.toChapterId },
        });
      }

      // 5. Update ChapterTransfer record to COMPLETED
      const completedTransfer = await tx.chapterTransfer.update({
        where: { id: transfer.id },
        data: {
          status: 'COMPLETED',
          districtReviewedAt: now,
          districtReviewNotes: input.remarks,
          completedAt: now,
          transferEffectiveDate: now,
        },
      });

      // 6. Audit Trail with comprehensive diff
      await tx.auditEvent.create({
        data: {
          organizationId: profile.organizationId,
          chapterId: transfer.toChapterId,
          actorId: actor.userId,
          actorEmail: actor.email,
          action: 'CHAPTER_TRANSFER_APPROVED_AND_EXECUTED',
          resource: 'ChapterTransfer',
          resourceId: transfer.id,
          diffJson: {
            memberProfileId: profile.id,
            previousChapter: { id: transfer.fromChapter.id, name: transfer.fromChapter.name },
            newChapter: { id: transfer.toChapter.id, name: transfer.toChapter.name },
            permanentMemberId: profile.memberships[0]?.membershipNumber || 'Unchanged',
            decision: 'APPROVE',
            remarks: input.remarks,
            effectiveDate: now.toISOString(),
          },
        },
      });

      // 7. Dispatch multi-party notifications
      await NotificationService.send({
        userId: profile.userId,
        title: 'Chapter Transfer Approved & Completed!',
        message: `Congratulations! Your official transfer to ${transfer.toChapter.name} is now complete. Your Member ID remains unchanged and your Digital ID Card is automatically synchronized.`,
      });

      return completedTransfer;
    });
  }

  /**
   * 14. SUPER ADMIN EXCEPTIONAL OVERRIDE
   */
  static async superAdminOverrideTransfer(
    actor: AuthActor,
    input: {
      transferId: string;
      action: 'FORCE_APPROVE' | 'FORCE_REJECT' | 'RESET_TO_PENDING';
      justification: string;
    }
  ) {
    if (!actor.roles.includes('SUPER_ADMIN')) {
      throw new Error('Forbidden: Super Administrator credentials required for governance overrides.');
    }

    if (!input.justification || input.justification.trim().length < 15) {
      throw new Error('Mandatory audit justification required for Super Admin override (minimum 15 characters).');
    }

    if (input.action === 'FORCE_APPROVE') {
      return await this.districtAdminFinalizeTransfer(actor, {
        transferId: input.transferId,
        decision: 'APPROVE',
        remarks: `[SUPER ADMIN OVERRIDE] ${input.justification}`,
      });
    }

    if (input.action === 'FORCE_REJECT') {
      return await this.districtAdminFinalizeTransfer(actor, {
        transferId: input.transferId,
        decision: 'REJECT',
        remarks: `[SUPER ADMIN OVERRIDE] ${input.justification}`,
      });
    }

    // RESET TO PENDING
    const transfer = await db.chapterTransfer.update({
      where: { id: input.transferId },
      data: {
        status: 'REQUESTED',
        rejectionReason: null,
        districtReviewNotes: `[Reset by Super Admin] ${input.justification}`,
      },
    });

    await db.auditEvent.create({
      data: {
        actorId: actor.userId,
        actorEmail: actor.email,
        action: 'SUPER_ADMIN_TRANSFER_RESET',
        resource: 'ChapterTransfer',
        resourceId: input.transferId,
        diffJson: { justification: input.justification },
      },
    });

    return transfer;
  }

  /**
   * 15. QUERY CHAPTER TRANSFERS WITH ROLE-SCOPED FILTERS
   */
  static async getChapterTransfers(
    actor: AuthActor,
    filters?: {
      status?: TransferStatus;
      chapterId?: string;
      direction?: 'INCOMING' | 'OUTGOING' | 'ALL';
      page?: number;
      pageSize?: number;
    }
  ) {
    const isSuperAdmin = actor.roles.includes('SUPER_ADMIN');
    const isDistrictAdmin = actor.roles.includes('DISTRICT_ADMIN');
    const page = Math.max(1, filters?.page || 1);
    const pageSize = Math.min(100, Math.max(10, filters?.pageSize || 20));
    const skip = (page - 1) * pageSize;

    const where: Prisma.ChapterTransferWhereInput = {};

    if (filters?.status) {
      where.status = filters.status;
    }

    if (isSuperAdmin || isDistrictAdmin) {
      if (filters?.chapterId && filters.chapterId !== 'ALL') {
        where.OR = [{ fromChapterId: filters.chapterId }, { toChapterId: filters.chapterId }];
      }
    } else {
      // Scoped to chapter officer's assigned chapter
      const chapterId = actor.chapterId;
      if (!chapterId) {
        throw new Error('Unauthorized: Chapter assignment required.');
      }

      if (filters?.direction === 'INCOMING') {
        where.toChapterId = chapterId;
      } else if (filters?.direction === 'OUTGOING') {
        where.fromChapterId = chapterId;
      } else {
        where.OR = [{ fromChapterId: chapterId }, { toChapterId: chapterId }];
      }
    }

    const [total, transfers] = await Promise.all([
      db.chapterTransfer.count({ where }),
      db.chapterTransfer.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { requestedAt: 'desc' },
        include: {
          fromChapter: { select: { id: true, name: true, code: true, slug: true } },
          toChapter: { select: { id: true, name: true, code: true, slug: true } },
          memberProfile: {
            select: {
              id: true,
              fullName: true,
              primaryPhone: true,
              email: true,
              taluk: true,
              memberships: {
                where: { status: 'ACTIVE' },
                select: { membershipNumber: true },
                take: 1,
              },
            },
          },
        },
      }),
    ]);

    return {
      transfers: transfers.map((t) => ({
        id: t.id,
        memberProfileId: t.memberProfileId,
        memberName: t.memberProfile.fullName,
        memberPhone: t.memberProfile.primaryPhone,
        memberEmail: t.memberProfile.email,
        membershipNumber: t.memberProfile.memberships[0]?.membershipNumber || 'N/A',
        memberTaluk: t.memberProfile.taluk || 'Malappuram',
        fromChapter: t.fromChapter,
        toChapter: t.toChapter,
        status: t.status,
        reason: t.reason,
        currentReviewNotes: t.currentReviewNotes,
        destinationReviewNotes: t.destinationReviewNotes,
        districtReviewNotes: t.districtReviewNotes,
        requestedAt: t.requestedAt.toISOString(),
        currentReviewedAt: t.currentReviewedAt ? t.currentReviewedAt.toISOString() : null,
        destinationReviewedAt: t.destinationReviewedAt ? t.destinationReviewedAt.toISOString() : null,
        districtReviewedAt: t.districtReviewedAt ? t.districtReviewedAt.toISOString() : null,
        completedAt: t.completedAt ? t.completedAt.toISOString() : null,
        rejectionReason: t.rejectionReason,
      })),
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize) || 1,
    };
  }

  /**
   * 16. QUERY IDENTITY CORRECTIONS WITH ROLE-SCOPED FILTERS
   */
  static async getCorrectionRequests(
    actor: AuthActor,
    filters?: {
      status?: CorrectionRequestStatus;
      field?: string;
      page?: number;
      pageSize?: number;
    }
  ) {
    const isDistrictAdmin = actor.roles.includes('DISTRICT_ADMIN');
    const isSuperAdmin = actor.roles.includes('SUPER_ADMIN');

    if (!isDistrictAdmin && !isSuperAdmin) {
      throw new Error('Forbidden: Administrative credentials required.');
    }

    const page = Math.max(1, filters?.page || 1);
    const pageSize = Math.min(100, Math.max(10, filters?.pageSize || 20));
    const skip = (page - 1) * pageSize;

    const where: Prisma.ProfileCorrectionRequestWhereInput = {};
    if (filters?.status) where.status = filters.status;
    if (filters?.field) where.field = filters.field;

    const [total, requests] = await Promise.all([
      db.profileCorrectionRequest.count({ where }),
      db.profileCorrectionRequest.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
        include: {
          memberProfile: {
            include: {
              chapter: { select: { id: true, name: true, code: true } },
              memberships: {
                where: { status: 'ACTIVE' },
                select: { membershipNumber: true },
                take: 1,
              },
            },
          },
        },
      }),
    ]);

    return {
      requests: requests.map((r) => ({
        id: r.id,
        memberProfileId: r.memberProfileId,
        memberName: r.memberProfile.fullName,
        memberPhone: r.memberProfile.primaryPhone,
        memberEmail: r.memberProfile.email,
        membershipNumber: r.memberProfile.memberships[0]?.membershipNumber || 'N/A',
        chapterName: r.memberProfile.chapter.name,
        field: r.field,
        oldValue: r.oldValue,
        requestedValue: r.requestedValue,
        reason: r.reason,
        documentUrl: r.documentUrl,
        status: r.status,
        reviewedAt: r.reviewedAt ? r.reviewedAt.toISOString() : null,
        reviewNotes: r.reviewNotes,
        createdAt: r.createdAt.toISOString(),
      })),
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize) || 1,
    };
  }

  /**
   * 17. DISTRICT ADMIN GOVERNANCE METRICS OVERVIEW
   */
  static async getGovernanceMetrics(actor: AuthActor) {
    const isDistrictAdmin = actor.roles.includes('DISTRICT_ADMIN');
    const isSuperAdmin = actor.roles.includes('SUPER_ADMIN');

    if (!isDistrictAdmin && !isSuperAdmin) {
      throw new Error('Forbidden: Administrative credentials required.');
    }

    const [
      pendingCorrections,
      pendingTransfers,
      awaitingChapterReview,
      completedTransfers,
      rejectedTransfers,
      recentAuditLogs,
    ] = await Promise.all([
      db.profileCorrectionRequest.count({ where: { status: 'PENDING' } }),
      db.chapterTransfer.count({ where: { status: 'DESTINATION_APPROVED' } }),
      db.chapterTransfer.count({ where: { status: { in: ['REQUESTED', 'CURRENT_APPROVED'] } } }),
      db.chapterTransfer.count({ where: { status: 'COMPLETED' } }),
      db.chapterTransfer.count({ where: { status: 'REJECTED' } }),
      db.auditEvent.findMany({
        where: {
          action: {
            in: [
              'CHAPTER_TRANSFER_REQUESTED',
              'CHAPTER_TRANSFER_RECOMMENDATION_RECOMMEND_APPROVAL',
              'CHAPTER_TRANSFER_APPROVED_AND_EXECUTED',
              'CHAPTER_TRANSFER_REJECTED_BY_DISTRICT',
              'IDENTITY_CORRECTION_REQUESTED',
              'IDENTITY_CORRECTION_APPROVED',
              'IDENTITY_CORRECTION_REJECTED',
              'PHONE_NUMBER_VERIFIED_AND_CHANGED',
              'EMAIL_VERIFIED_AND_CHANGED',
            ],
          },
        },
        take: 10,
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return {
      pendingCorrections,
      pendingTransfers,
      awaitingChapterReview,
      completedTransfers,
      rejectedTransfers,
      recentAuditLogs: recentAuditLogs.map((l) => ({
        id: l.id,
        action: l.action,
        resource: l.resource,
        actorEmail: l.actorEmail || 'System',
        createdAt: l.createdAt.toISOString(),
        diffJson: l.diffJson,
      })),
    };
  }

  /**
   * 18. REQUEST MEMBERSHIP REMOVAL / DEACTIVATION
   * Initiated by Chapter Executive, District Admin, or Super Admin with mandatory justification.
   */
  static async requestMembershipDeactivation(
    actor: AuthActor,
    input: {
      memberProfileId: string;
      reason: string;
      category?: string;
    }
  ) {
    if (!actor || actor.status !== 'ACTIVE') {
      throw new Error('Unauthorized: Active authentication required.');
    }

    const profile = await db.memberProfile.findUnique({
      where: { id: input.memberProfileId },
      include: {
        user: true,
        chapter: true,
        memberships: {
          where: { status: 'ACTIVE' },
          take: 1,
        },
      },
    });

    if (!profile) {
      throw new Error('Member profile not found.');
    }

    // Role check: Super Admin, District Admin, or appointed chapter officer for this chapter
    const isSuperAdmin = actor.roles.includes('SUPER_ADMIN');
    const isDistrictAdmin = actor.roles.includes('DISTRICT_ADMIN');
    const isChapterOfficer = actor.roles.some((r) =>
      [
        'CHAPTER_PRESIDENT',
        'CHAPTER_SECRETARY',
        'CHAPTER_TREASURER',
        'CHAPTER_COORDINATOR',
        'MEMBERSHIP_OFFICER',
      ].includes(r)
    );

    const isAuthorized =
      isSuperAdmin ||
      isDistrictAdmin ||
      (isChapterOfficer && actor.chapterId === profile.chapterId);

    if (!isAuthorized) {
      throw new Error('Forbidden: You are not authorized to request membership removal for this chapter.');
    }

    if (!input.reason || input.reason.trim().length < 10) {
      throw new Error('Validation Error: A detailed justification (minimum 10 characters) is required for membership removal.');
    }

    // Guard against duplicate active removal requests
    const existingPending = await db.profileCorrectionRequest.findFirst({
      where: {
        memberProfileId: profile.id,
        field: 'MEMBERSHIP_DEACTIVATION',
        status: { in: ['PENDING', 'CLARIFICATION_REQUESTED'] },
      },
    });

    if (existingPending) {
      throw new Error('A membership removal request is already pending for this member.');
    }

    const membership = profile.memberships[0];
    const membershipNumber = membership?.membershipNumber || 'PENDING';

    const metadata = {
      initiatorId: actor.userId,
      initiatorEmail: actor.email,
      initiatorRole:
        actor.roles.find((r) => r.startsWith('CHAPTER_') || r === 'DISTRICT_ADMIN' || r === 'SUPER_ADMIN') ||
        actor.roles[0],
      membershipNumber,
      category: input.category || 'ADMINISTRATIVE_DISQUALIFICATION',
      chapterName: profile.chapter.name,
      chapterCode: profile.chapter.code,
      chapterId: profile.chapter.id,
      submittedAt: new Date().toISOString(),
    };

    return await db.$transaction(
      async (tx) => {
        const request = await tx.profileCorrectionRequest.create({
          data: {
            memberProfileId: profile.id,
            field: 'MEMBERSHIP_DEACTIVATION',
            oldValue: 'ACTIVE',
            requestedValue: 'DEACTIVATED',
            reason: input.reason.trim(),
            status: 'PENDING',
            reviewNotes: JSON.stringify(metadata),
          },
        });

        await tx.auditEvent.create({
          data: {
            organizationId: profile.organizationId,
            chapterId: profile.chapterId,
            actorId: actor.userId,
            actorEmail: actor.email,
            action: 'MEMBERSHIP_DEACTIVATION_REQUESTED',
            resource: 'MemberProfile',
            resourceId: profile.id,
            diffJson: {
              requestId: request.id,
              membershipNumber,
              reason: input.reason.trim(),
              metadata,
            },
          },
        });

        return {
          success: true,
          requestId: request.id,
          message: `Membership removal request for ${profile.fullName} (${membershipNumber}) submitted successfully and forwarded for administrative review.`,
        };
      },
      { maxWait: 15000, timeout: 30000 }
    );
  }

  /**
   * 19. RECOMMEND MEMBERSHIP DEACTIVATION (District Admin Maker-Checker Stage)
   */
  static async recommendMembershipDeactivation(
    actor: AuthActor,
    input: {
      requestId: string;
      decision: 'RECOMMEND_DEACTIVATION' | 'REJECT' | 'REQUEST_CLARIFICATION';
      reviewNotes: string;
    }
  ) {
    if (!actor || actor.status !== 'ACTIVE') {
      throw new Error('Unauthorized: Active session required.');
    }

    const isDistrictAdmin = actor.roles.includes('DISTRICT_ADMIN');
    const isSuperAdmin = actor.roles.includes('SUPER_ADMIN');

    if (!isDistrictAdmin && !isSuperAdmin) {
      throw new Error('Forbidden: District Administrator credentials required to review deactivation requests.');
    }

    const request = await db.profileCorrectionRequest.findUnique({
      where: { id: input.requestId },
      include: {
        memberProfile: {
          include: { chapter: true, user: true },
        },
      },
    });

    if (!request || request.field !== 'MEMBERSHIP_DEACTIVATION') {
      throw new Error('Deactivation request not found.');
    }

    if (request.status !== 'PENDING' && request.status !== 'CLARIFICATION_REQUESTED') {
      throw new Error(`This deactivation request has already been ${request.status.toLowerCase()}.`);
    }

    const profile = request.memberProfile;

    return await db.$transaction(
      async (tx) => {
        let newStatus: CorrectionRequestStatus = 'PENDING';
        if (input.decision === 'REJECT') {
          newStatus = 'REJECTED';
        } else if (input.decision === 'REQUEST_CLARIFICATION') {
          newStatus = 'CLARIFICATION_REQUESTED';
        }

        let meta: Record<string, any> = {};
        try {
          meta = JSON.parse(request.reviewNotes || '{}');
        } catch {
          meta = { raw: request.reviewNotes };
        }

        meta.districtReview = {
          reviewedBy: actor.userId,
          reviewedAt: new Date().toISOString(),
          decision: input.decision,
          remarks: input.reviewNotes,
        };

        const updated = await tx.profileCorrectionRequest.update({
          where: { id: request.id },
          data: {
            status: newStatus,
            reviewedById: actor.userId,
            reviewedAt: new Date(),
            reviewNotes: JSON.stringify(meta),
          },
        });

        await tx.auditEvent.create({
          data: {
            organizationId: profile.organizationId,
            chapterId: profile.chapterId,
            actorId: actor.userId,
            actorEmail: actor.email,
            action: `MEMBERSHIP_DEACTIVATION_DISTRICT_${input.decision}`,
            resource: 'ProfileCorrectionRequest',
            resourceId: request.id,
            diffJson: {
              decision: input.decision,
              remarks: input.reviewNotes,
            },
          },
        });

        return {
          success: true,
          status: newStatus,
          message:
            input.decision === 'RECOMMEND_DEACTIVATION'
              ? 'Deactivation recommended and forwarded to Super Admin for final approval.'
              : input.decision === 'REJECT'
              ? 'Deactivation request rejected by District Administration.'
              : 'Clarification requested from chapter executive.',
        };
      },
      { maxWait: 15000, timeout: 30000 }
    );
  }

  /**
   * 20. FINALIZE MEMBERSHIP DEACTIVATION (Super Admin Final Decision)
   * Atomically deactivates membership, cards, and user account, and revokes active sessions.
   * NEVER deletes historical records, audit logs, or attendance.
   */
  static async finalizeMembershipDeactivation(
    actor: AuthActor,
    input: {
      requestId: string;
      action: 'APPROVE_DEACTIVATION' | 'REJECT';
      justification: string;
    }
  ) {
    if (!actor || !actor.roles.includes('SUPER_ADMIN')) {
      throw new Error('Forbidden: Only Super Administrator can finalize membership deactivations.');
    }

    const request = await db.profileCorrectionRequest.findUnique({
      where: { id: input.requestId },
      include: {
        memberProfile: {
          include: { chapter: true, user: true, memberships: true },
        },
      },
    });

    if (!request || request.field !== 'MEMBERSHIP_DEACTIVATION') {
      throw new Error('Deactivation request not found.');
    }

    if (request.status !== 'PENDING' && request.status !== 'CLARIFICATION_REQUESTED') {
      throw new Error(`This request has already been ${request.status.toLowerCase()}.`);
    }

    const profile = request.memberProfile;

    return await db.$transaction(
      async (tx) => {
        let meta: Record<string, any> = {};
        try {
          meta = JSON.parse(request.reviewNotes || '{}');
        } catch {
          meta = { raw: request.reviewNotes };
        }

        meta.superAdminDecision = {
          decidedBy: actor.userId,
          decidedAt: new Date().toISOString(),
          action: input.action,
          justification: input.justification,
        };

        if (input.action === 'REJECT') {
          await tx.profileCorrectionRequest.update({
            where: { id: request.id },
            data: {
              status: 'REJECTED',
              reviewedById: actor.userId,
              reviewedAt: new Date(),
              reviewNotes: JSON.stringify(meta),
            },
          });

          await tx.auditEvent.create({
            data: {
              organizationId: profile.organizationId,
              chapterId: profile.chapterId,
              actorId: actor.userId,
              actorEmail: actor.email,
              action: 'MEMBERSHIP_DEACTIVATION_SUPER_ADMIN_REJECTED',
              resource: 'ProfileCorrectionRequest',
              resourceId: request.id,
              diffJson: { justification: input.justification },
            },
          });

          return {
            success: true,
            status: 'REJECTED',
            message: `Deactivation request for ${profile.fullName} was rejected. Member remains active.`,
          };
        }

        // APPROVE DEACTIVATION
        // 1. Update request status to APPROVED
        await tx.profileCorrectionRequest.update({
          where: { id: request.id },
          data: {
            status: 'APPROVED',
            reviewedById: actor.userId,
            reviewedAt: new Date(),
            reviewNotes: JSON.stringify(meta),
          },
        });

        // 2. Transactionally update all active memberships for this member to DEACTIVATED
        await tx.membership.updateMany({
          where: {
            memberProfileId: profile.id,
            status: { in: ['ACTIVE', 'RENEWAL_DUE'] },
          },
          data: {
            status: 'DEACTIVATED',
          },
        });

        // 3. Revoke all digital ID cards
        await tx.membershipIdCard.updateMany({
          where: {
            membership: { memberProfileId: profile.id },
            status: 'ACTIVE',
          },
          data: {
            status: 'REVOKED',
          },
        });

        // 4. Update User account status to DEACTIVATED
        await tx.user.update({
          where: { id: profile.userId },
          data: {
            status: 'DEACTIVATED',
          },
        });

        // 5. Invalidate and delete all active sessions for this user (immediate access cutoff)
        await tx.session.deleteMany({
          where: { userId: profile.userId },
        });

        // 6. Record immutable AuditEvent
        await tx.auditEvent.create({
          data: {
            organizationId: profile.organizationId,
            chapterId: profile.chapterId,
            actorId: actor.userId,
            actorEmail: actor.email,
            action: 'MEMBERSHIP_DEACTIVATED',
            resource: 'Membership',
            resourceId: profile.id,
            diffJson: {
              targetUserId: profile.userId,
              memberProfileId: profile.id,
              justification: input.justification,
              meta,
            },
          },
        });

        // 7. Notification for history
        await tx.notification.create({
          data: {
            userId: profile.userId,
            title: 'MYBF Membership Deactivated',
            message: `Your MYBF membership has been deactivated by administrative governance. Reason: ${input.justification}`,
            channel: 'IN_APP',
          },
        });

        return {
          success: true,
          status: 'DEACTIVATED',
          message: `Membership for ${profile.fullName} successfully deactivated. All sessions revoked and card invalidated. Historical data preserved.`,
        };
      },
      { maxWait: 15000, timeout: 30000 }
    );
  }
}
