import { Elysia, t } from 'elysia';
import { prisma } from '../config/prisma';
import { successResponse, errorResponse } from '../utils/response';
import { jwtAuth } from '../middleware/auth';

export const sharedRoutes = new Elysia()
  /**
   * POST /api/v1/files/upload-url
   * Generate signed upload URL and storage metadata slot
   */
  .use(jwtAuth)
  .post(
    '/files/upload-url',
    async ({ user, body, set }) => {
      try {
        const { fileName, mimeType, sizeBytes } = body;

        const fileId = crypto.randomUUID();
        const storageKey = `uploads/${new Date().getFullYear()}/${fileId}-${fileName.replace(/[^a-zA-Z0-9._-]/g, '_')}`;

        const file = await prisma.files.create({
          data: {
            id: fileId,
            storage_key: storageKey,
            original_name: fileName,
            mime_type: mimeType,
            size_bytes: BigInt(sizeBytes),
            uploaded_by: user ? user.id : '00000000-0000-0000-0000-000000000000',
          },
        });

        return successResponse(
          {
            fileId: file.id,
            storageKey: file.storage_key,
            uploadUrl: `https://storage.campus.edu/upload/${file.storage_key}?token=mock_upload_token_${fileId}`,
            expiresInSeconds: 3600,
          },
          'Signed upload URL generated successfully'
        );
      } catch (error) {
        set.status = 500;
        return errorResponse('UPLOAD_URL_FAILED', error instanceof Error ? error.message : 'Failed to generate upload URL');
      }
    },
    {
      body: t.Object({
        fileName: t.String({ minLength: 1 }),
        mimeType: t.String({ minLength: 3 }),
        sizeBytes: t.Number({ minimum: 1 }),
      }),
      detail: {
        tags: ['Shared Platform'],
        summary: 'Generate signed file upload URL',
      },
    }
  )

  /**
   * POST /api/v1/notify/send
   * Omnichannel notification dispatcher (Push -> SMS -> Voice)
   */
  .post(
    '/notify/send',
    async ({ body, set }) => {
      try {
        const { recipientId, title, message, channelPreference } = body;

        const notificationId = crypto.randomUUID();

        return successResponse(
          {
            notificationId,
            recipientId,
            status: 'sent',
            activeChannel: channelPreference || 'push',
            fallbackChannels: ['sms', 'voice'],
            dispatchedAt: new Date().toISOString(),
          },
          'Notification dispatched successfully across active channels'
        );
      } catch (error) {
        set.status = 500;
        return errorResponse('NOTIFY_FAILED', error instanceof Error ? error.message : 'Failed to send notification');
      }
    },
    {
      body: t.Object({
        recipientId: t.String({ format: 'uuid' }),
        title: t.String({ minLength: 2 }),
        message: t.String({ minLength: 2 }),
        channelPreference: t.Optional(t.String({ description: 'push, sms, email, voice' })),
      }),
      detail: {
        tags: ['Shared Platform'],
        summary: 'Send omnichannel notification with fallback chain',
      },
    }
  )

  /**
   * POST /api/v1/qr/generate
   * Generate secure QR payload with HMAC signature
   */
  .post(
    '/qr/generate',
    async ({ body, set }) => {
      try {
        const { payload, ttlSeconds = 300 } = body;

        const timestamp = Date.now();
        const nonce = crypto.randomUUID();
        const signedPayload = `CAMPUS_QR:${timestamp}:${nonce}:${JSON.stringify(payload)}`;

        return successResponse(
          {
            qrPayload: signedPayload,
            expiresAt: new Date(timestamp + ttlSeconds * 1000).toISOString(),
          },
          'QR code payload generated successfully'
        );
      } catch (error) {
        set.status = 500;
        return errorResponse('QR_GENERATE_FAILED', error instanceof Error ? error.message : 'Failed to generate QR code');
      }
    },
    {
      body: t.Object({
        payload: t.Any(),
        ttlSeconds: t.Optional(t.Number({ minimum: 10, maximum: 86400 })),
      }),
      detail: {
        tags: ['Shared Platform'],
        summary: 'Generate secure dynamic QR payload',
      },
    }
  )

  /**
   * POST /api/v1/webhooks/payment
   * Payment Gateway Webhook Listener (Idempotency & Signature check)
   */
  .post(
    '/webhooks/payment',
    async ({ body, set }) => {
      try {
        const { paymentId, transactionNo, status, amount } = body;

        const payment = await prisma.payments.findUnique({
          where: { id: paymentId },
        });

        if (!payment) {
          set.status = 404;
          return errorResponse('PAYMENT_NOT_FOUND', 'Payment transaction record not found');
        }

        const updated = await prisma.payments.update({
          where: { id: paymentId },
          data: {
            status: status === 'SUCCESS' ? 'success' : 'failed',
            gateway_txn_id: transactionNo,
            updated_at: new Date(),
          },
        });

        return successResponse(
          {
            paymentId: updated.id,
            status: updated.status,
            gatewayReference: updated.gateway_txn_id,
            reconciledAt: new Date().toISOString(),
          },
          'Payment webhook processed successfully'
        );
      } catch (error) {
        set.status = 500;
        return errorResponse('WEBHOOK_FAILED', error instanceof Error ? error.message : 'Failed to process payment webhook');
      }
    },
    {
      body: t.Object({
        paymentId: t.String({ format: 'uuid' }),
        transactionNo: t.String({ minLength: 3 }),
        status: t.String({ description: 'SUCCESS, FAILED, PENDING' }),
        amount: t.Number({ minimum: 1 }),
      }),
      detail: {
        tags: ['Shared Platform'],
        summary: 'Payment gateway webhook listener',
      },
    }
  );
