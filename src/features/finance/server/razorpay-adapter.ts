import 'server-only';
import crypto from 'crypto';

export class PaymentGatewayAdapter {
  private static webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || 'rzp_test_webhook_secret';

  /**
   * Cryptographically verifies Razorpay payment signature
   */
  static verifyPaymentSignature(orderId: string, paymentId: string, signature: string): boolean {
    const keySecret = process.env.RAZORPAY_KEY_SECRET || 'rzp_test_dummy_secret';
    const generated = crypto
      .createHmac('sha256', keySecret)
      .update(`${orderId}|${paymentId}`)
      .digest('hex');

    return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(generated));
  }

  /**
   * Cryptographically verifies Razorpay webhook signature header
   */
  static verifyWebhookSignature(payloadRaw: string, signature: string): boolean {
    const generated = crypto
      .createHmac('sha256', this.webhookSecret)
      .update(payloadRaw)
      .digest('hex');

    return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(generated));
  }
}
