import { describe, expect, it, beforeAll } from 'bun:test';
import { Elysia } from 'elysia';
import { transportPlacementsRoutes } from '../../src/routes/transport_placements';
import { prisma } from '../../src/config/prisma';
import { hashPassword } from '../../src/utils/password';
import { signAccessToken } from '../../src/utils/jwt';

const app = new Elysia().group('/api/v1', (app) => app.use(transportPlacementsRoutes));

describe('Integration Test Suite: Transport Fleet, Clubs & Placements APIs', () => {
  let authToken: string;
  let userId: string;
  let vehicleId: string;

  beforeAll(async () => {
    const passwordHash = await hashPassword('TransportPass123!');
    const user = await prisma.users.create({
      data: {
        id: crypto.randomUUID(),
        user_code: `TRN_USER_${Date.now()}`,
        email: `trn_user_${Date.now()}@example.com`,
        full_name: 'Integration Transport User',
        password_hash: passwordHash,
        status: 'active',
      },
    });
    userId = user.id;
    authToken = `Bearer ${signAccessToken({ sub: user.id })}`;
  });

  describe('Transport Fleet & GPS Telemetry', () => {
    it('POST /api/v1/admin/vehicles - should register vehicle', async () => {
      const res = await app.handle(
        new Request('http://localhost/api/v1/admin/vehicles', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: authToken,
          },
          body: JSON.stringify({
            registrationNo: `KA-01-EQ-${Math.floor(Math.random() * 8999 + 1000)}`,
            capacity: 40,
          }),
        })
      );
      expect(res.status).toBe(200);
      const json: any = await res.json();
      expect(json.success).toBe(true);
      expect(json.data.id).toBeDefined();
      vehicleId = json.data.id;
    });

    it('GET /api/v1/admin/vehicles - should list fleet vehicles', async () => {
      const res = await app.handle(
        new Request('http://localhost/api/v1/admin/vehicles', {
          headers: { Authorization: authToken },
        })
      );
      expect(res.status).toBe(200);
      const json: any = await res.json();
      expect(json.success).toBe(true);
      expect(Array.isArray(json.data)).toBe(true);
    });

    it('POST /api/v1/driver/vehicles/:id/location - should stream GPS telemetry update', async () => {
      const res = await app.handle(
        new Request(`http://localhost/api/v1/driver/vehicles/${vehicleId}/location`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: authToken,
          },
          body: JSON.stringify({
            latitude: 12.9716,
            longitude: 77.5946,
          }),
        })
      );
      expect(res.status).toBe(200);
      const json: any = await res.json();
      expect(json.success).toBe(true);
      expect(json.data.latitude).toBe(12.9716);
    });
  });

  describe('Clubs, Events & Placements', () => {
    it('GET /api/v1/clubs - should list student clubs', async () => {
      const res = await app.handle(
        new Request('http://localhost/api/v1/clubs', {
          headers: { Authorization: authToken },
        })
      );
      expect(res.status).toBe(200);
      const json: any = await res.json();
      expect(json.success).toBe(true);
    });

    it('POST /api/v1/clubs - should create new student club', async () => {
      const res = await app.handle(
        new Request('http://localhost/api/v1/clubs', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: authToken,
          },
          body: JSON.stringify({
            name: `Robotics Club_${Date.now()}`,
            category: 'technical',
          }),
        })
      );
      expect(res.status).toBe(200);
      const json: any = await res.json();
      expect(json.success).toBe(true);
    });

    it('GET /api/v1/placements/companies - should fetch campus placement companies', async () => {
      const res = await app.handle(
        new Request('http://localhost/api/v1/placements/companies', {
          headers: { Authorization: authToken },
        })
      );
      expect(res.status).toBe(200);
      const json: any = await res.json();
      expect(json.success).toBe(true);
    });

    it('POST /api/v1/placements/companies - should register placement company profile', async () => {
      const res = await app.handle(
        new Request('http://localhost/api/v1/placements/companies', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: authToken,
          },
          body: JSON.stringify({
            name: `TechCorp Solutions ${Date.now()}`,
            industry: 'Software Engineering',
            website: 'https://techcorp.example.com',
          }),
        })
      );
      expect(res.status).toBe(200);
      const json: any = await res.json();
      expect(json.success).toBe(true);
    });
  });
});
