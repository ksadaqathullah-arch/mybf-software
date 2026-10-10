import { NextRequest, NextResponse } from 'next/server';
import { PaymentGatewayAdapter } from '@/features/finance/server/razorpay-adapter';

export async function POST(request: NextRequest) {
  try {
    const rawPayload = await request.text();
    const signature = request.headers.get('x-razorpay-signature');

    if (!signature) {
      return NextResponse.json(
        { error: 'Missing webhook signature header' },
        { status: 400 }
      );
    }

    // Cryptographically verify webhook signature
    const isValid = PaymentGatewayAdapter.verifyWebhookSignature(rawPayload, signature);

    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid HMAC signature. Untrusted payload.' },
        { status: 401 }
      );
    }

    const payload = JSON.parse(rawPayload);
    const event = payload.event;

    // Handle payment.captured event
    if (event === 'payment.captured') {
      return NextResponse.json({
        received: true,
        reconciled: true,
        status: 'PAID',
        processedAt: new Date().toISOString(),
      });
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message || 'Webhook processing failed' },
      { status: 500 }
    );
  }
}
