import { NextRequest, NextResponse } from 'next/server';
import { memberRegistrationSchema } from '@/features/memberships/schemas/membership.schema';
import { MembershipService } from '@/features/memberships/server/membership.service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const parsed = memberRegistrationSchema.safeParse(body);
    if (!parsed.success) {
      const firstError = parsed.error.issues[0]?.message || 'Validation failed.';
      return NextResponse.json(
        {
          success: false,
          error: firstError,
          details: parsed.error.format(),
        },
        { status: 422 }
      );
    }

    const result = await MembershipService.submitApplication(parsed.data);

    return NextResponse.json(
      {
        success: true,
        referenceNumber: result.referenceNumber,
        isAgeException: result.isAgeException,
        applicantAge: result.applicantAge,
        status: result.application.status,
        message: result.isAgeException
          ? 'Special age exception application submitted successfully. It will be reviewed by the Super Admin.'
          : 'Membership application submitted successfully. It will be reviewed by your chapter officers.',
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Membership registration error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'An unexpected error occurred during registration.',
      },
      { status: 400 }
    );
  }
}
