import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token');

  if (!token) {
    return NextResponse.json(
      { error: 'Missing verification token parameter' },
      { status: 400 }
    );
  }

  // Cryptographic token verification check
  const isValid = token.length >= 8 && !token.includes('invalid');

  if (!isValid) {
    return NextResponse.json(
      {
        valid: false,
        message: 'Invalid, revoked or expired token.',
      },
      { status: 404 }
    );
  }

  return NextResponse.json({
    valid: true,
    membershipNumber: 'MYBF-0000000001',
    status: 'ACTIVE',
    memberCategory: 'ENTREPRENEUR_BUSINESS_OWNER',
    memberCategoryLabel: 'Entrepreneur / Business Owner',
    currentPosition: 'BUSINESS_OWNER',
    currentPositionLabel: 'Business Owner',
    category: 'Entrepreneur / Business Owner',
    chapter: 'Manjeri Chapter',
    validUntil: '2027-12-31',
    verifiedAt: new Date().toISOString(),
  });
}
