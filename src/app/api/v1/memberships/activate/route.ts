import { NextRequest, NextResponse } from 'next/server';
import { accountActivationSchema } from '@/features/memberships/schemas/membership.schema';
import { MembershipService } from '@/features/memberships/server/membership.service';

/**
 * GET: Verifies an activation token without consuming it.
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json(
        { valid: false, error: 'Activation token is required.' },
        { status: 400 }
      );
    }

    const verification = await MembershipService.verifyActivationToken(token);

    return NextResponse.json({
      valid: true,
      data: verification,
    });
  } catch (error: any) {
    return NextResponse.json(
      { valid: false, error: error.message || 'Invalid or expired activation token.' },
      { status: 400 }
    );
  }
}

/**
 * POST: Completes account activation by setting username and password.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const parsed = accountActivationSchema.safeParse(body);
    if (!parsed.success) {
      const firstError = parsed.error.issues[0]?.message || 'Invalid activation data.';
      return NextResponse.json(
        { success: false, error: firstError },
        { status: 422 }
      );
    }

    const result = await MembershipService.activateAccount(parsed.data);

    return NextResponse.json({
      success: true,
      message: result.message,
      username: result.username,
      membershipNumber: result.membershipNumber,
    });
  } catch (error: any) {
    console.error('Account activation error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to complete activation.' },
      { status: 400 }
    );
  }
}
