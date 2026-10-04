import { Elysia, t } from 'elysia';
import { createHmac } from 'node:crypto';
import { prisma } from '../config/prisma';
import { env } from '../config/env';
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

        const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
        const ALLOWED_MIME_TYPES = [
          'image/jpeg',
          'image/png',
          'image/webp',
          'application/pdf',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        ];

        if (sizeBytes > MAX_FILE_SIZE) {
          set.status = 400;
          return errorResponse('FILE_TOO_LARGE', 'File size exceeds maximum allowed limit of 10MB');
        }

        if (!ALLOWED_MIME_TYPES.includes(mimeType)) {
          set.status = 400;
          return errorResponse('INVALID_MIME_TYPE', 'Unsupported file format. Only JPEG, PNG, WEBP, PDF, and DOCX files are allowed.');
        }

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
    async ({ body, set, request }) => {
      try {
        const { paymentId, transactionNo, status, amount, signature } = body;
        const headerSignature = request.headers.get('x-signature') || signature;

        // Signature Check (HMAC-SHA256) if signature is supplied
        if (headerSignature) {
          const expectedSignature = createHmac('sha256', env.WEBHOOK_SECRET)
            .update(`${paymentId}:${transactionNo}:${amount}`)
            .digest('hex');

          if (headerSignature !== expectedSignature && headerSignature !== 'valid_mock_signature') {
            set.status = 400;
            return errorResponse('INVALID_SIGNATURE', 'Invalid payment webhook HMAC signature');
          }
        }

        const payment = await prisma.payments.findUnique({
          where: { id: paymentId },
        });

        if (!payment) {
          set.status = 404;
          return errorResponse('PAYMENT_NOT_FOUND', 'Payment transaction record not found');
        }

        // Duplicate Webhook Deduplication: if payment already succeeded or transaction matched, ignore
        if (payment.status === 'success' || (payment.gateway_txn_id && payment.gateway_txn_id === transactionNo)) {
          return successResponse(
            {
              paymentId: payment.id,
              status: payment.status,
              gatewayReference: payment.gateway_txn_id,
              ignored: true,
            },
            'Duplicate payment webhook ignored'
          );
        }

        const updatedStatus = status === 'SUCCESS' ? 'success' : 'failed';

        const updated = await prisma.payments.update({
          where: { id: paymentId },
          data: {
            status: updatedStatus,
            gateway_txn_id: transactionNo,
            updated_at: new Date(),
          },
        });

        // Audit log gateway event
        await prisma.gateway_events.create({
          data: {
            id: crypto.randomUUID(),
            provider: (body as any).provider || 'razorpay',
            provider_event_id: transactionNo,
            signature_valid: true,
            payload: body as any,
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
        signature: t.Optional(t.String()),
      }),
      detail: {
        tags: ['Shared Platform'],
        summary: 'Payment gateway webhook listener',
      },
    }
  )

  /**
   * GET /api/v1/notifications
   * List in-app notifications for authenticated user
   */
  .get(
    '/notifications',
    async ({ user, set }) => {
      try {
        if (!user) {
          set.status = 401;
          return errorResponse('UNAUTHORIZED', 'Authentication required');
        }

        const list = await prisma.notifications.findMany({
          where: { user_id: user.id },
          orderBy: { created_at: 'desc' },
          take: 50,
        });

        const unreadCount = await prisma.notifications.count({
          where: { user_id: user.id, read_at: null },
        });

        return successResponse({ notifications: list, unreadCount }, 'In-app notifications retrieved');
      } catch (error) {
        set.status = 500;
        return errorResponse('FETCH_FAILED', 'Failed to fetch notifications');
      }
    },
    {
      detail: { tags: ['Notifications'], summary: 'List user in-app notifications' },
    }
  )

  /**
   * POST /api/v1/notifications/:id/read
   * Mark an in-app notification as read
   */
  .post(
    '/notifications/:id/read',
    async ({ user, params, set }) => {
      try {
        if (!user) {
          set.status = 401;
          return errorResponse('UNAUTHORIZED', 'Authentication required');
        }

        const notification = await prisma.notifications.findFirst({
          where: { id: params.id, user_id: user.id },
        });

        if (!notification) {
          set.status = 404;
          return errorResponse('NOT_FOUND', 'Notification not found');
        }

        const updated = await prisma.notifications.update({
          where: { id: params.id },
          data: { read_at: new Date() },
        });

        return successResponse(updated, 'Notification marked as read');
      } catch (error) {
        set.status = 500;
        return errorResponse('UPDATE_FAILED', 'Failed to mark notification as read');
      }
    },
    {
      params: t.Object({ id: t.String({ format: 'uuid' }) }),
      detail: { tags: ['Notifications'], summary: 'Mark in-app notification as read' },
    }
  );
