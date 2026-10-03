import { EventEmitter } from 'node:events';

export interface LocationTelemetryPayload {
  vehicleId: string;
  latitude: number;
  longitude: number;
  speed?: number;
  heading?: number;
  timestamp: string;
}

export interface SOSEventPayload {
  incidentId: string;
  studentId: string;
  studentName?: string;
  studentPhone?: string;
  locationDetails?: string;
  latitude?: number;
  longitude?: number;
  timestamp: string;
  status: 'active' | 'acknowledged' | 'resolved';
}

class RealtimePubSub extends EventEmitter {
  constructor() {
    super();
    this.setMaxListeners(50);
  }

  publishLocationUpdate(payload: LocationTelemetryPayload) {
    this.emit(`location:${payload.vehicleId}`, payload);
    this.emit('location:broadcast', payload);
  }

  publishSOSEvent(payload: SOSEventPayload) {
    this.emit('sos:alert', payload);
  }
}

export const realtimePubSub = new RealtimePubSub();
