import 'server-only';
import { db } from '@/server/db';
import { Prisma } from '@prisma/client';
import crypto from 'crypto';
import { CreatePaymentIntentInput } from '../schemas/payment.schema';
import { PaymentGatewayAdapter } from './razorpay-adapter';

export class PaymentService {
  /**
   * Creates or retrieves idempotent payment intent
   */
  static async createPaymentIntent(userId: string, organizationId: string, input: CreatePaymentIntentInput) {
    // Check if intent with idempotencyKey already exists
    const existing = await db.paymentIntent.findUnique({
      where: { idempotencyKey: input.idempotencyKey },
    });

    if (existing) {
      return existing;
    }

    const gatewayOrderId = `order_${crypto.randomBytes(8).toString('hex')}`;

    return await db.paymentIntent.create({
      data: {
        organizationId,
        chapterId: input.chapterId,
        userId,
        amountINR: input.amountINR,
        purpose: input.purpose,
        idempotencyKey: input.idempotencyKey,
        gatewayOrderId,
        status: 'CREATED',
        notes: input.notes,
      },
    });
  }

  /**
   * Reconciles trusted payment webhook from gateway
   * Never marks payment settled based solely on client redirect
   */
  static async processWebhookPaymentCaptured(
    gatewayOrderId: string,
    gatewayPaymentId: string,
    gatewaySignature: string,
    rawPayload: Record<string, unknown>
  ) {
    // Verify gateway signature
    const isValid = PaymentGatewayAdapter.verifyPaymentSignature(
      gatewayOrderId,
      gatewayPaymentId,
      gatewaySignature
    );

    if (!isValid) {
      throw new Error('Payment webhook signature verification failed. Untrusted payload.');
    }

    return await db.$transaction(async (tx) => {
      const intent = await tx.paymentIntent.findUnique({
        where: { gatewayOrderId },
      });

      if (!intent) {
        throw new Error(`Payment intent not found for order ${gatewayOrderId}`);
      }

      if (intent.status === 'PAID') {
        return { status: 'ALREADY_PROCESSED', intentId: intent.id };
      }

      // Update intent to PAID
      const updatedIntent = await tx.paymentIntent.update({
        where: { id: intent.id },
        data: { status: 'PAID' },
      });

      // Record immutable transaction record
      await tx.paymentTransaction.create({
        data: {
          paymentIntentId: intent.id,
          gatewayPaymentId,
          gatewaySignature,
          gatewayProvider: 'RAZORPAY',
          amountINR: intent.amountINR,
          status: 'PAID',
          rawWebhookPayload: rawPayload as unknown as Prisma.InputJsonObject,
        },
      });

      // Issue formal tax invoice
      const invoiceNumber = `INV-${new Date().getFullYear()}-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
      await tx.invoice.create({
        data: {
          organizationId: intent.organizationId,
          chapterId: intent.chapterId,
          userId: intent.userId,
          paymentIntentId: intent.id,
          invoiceNumber,
          totalAmountINR: intent.amountINR,
          status: 'PAID',
        },
      });

      // Audit event
      await tx.auditEvent.create({
        data: {
          organizationId: intent.organizationId,
          chapterId: intent.chapterId,
          actorId: intent.userId,
          action: 'PAYMENT_SETTLED',
          resource: 'PaymentIntent',
          resourceId: intent.id,
          diffJson: {
            amountINR: intent.amountINR,
            gatewayPaymentId,
            invoiceNumber,
          },
        },
      });

      return { status: 'SUCCESS', invoiceNumber, intentId: updatedIntent.id };
    });
  }
}
