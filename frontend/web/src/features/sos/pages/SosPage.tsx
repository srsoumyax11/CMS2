import React, { useState, useEffect } from 'react';
import { sosApi, SosRecord, EmergencyContactInfo } from '@/features/sos/api';
import { createIdempotencyKey } from '@/lib/apiClient';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { MockBanner } from '@/components/ui/MockBanner';
import {
  AlertOctagon,
  MapPin,
  PhoneCall,
  ShieldAlert,
  XCircle,
} from 'lucide-react';

export const SosPage: React.FC = () => {
  const [activeAlerts, setActiveAlerts] = useState<SosRecord[]>([]);
  const [contacts, setContacts] = useState<EmergencyContactInfo[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [emergencyType, setEmergencyType] = useState<'MEDICAL' | 'SECURITY' | 'FIRE' | 'OTHER'>('SECURITY');
  const [location, setLocation] = useState('');
  const [coords, setCoords] = useState<{ lat?: number; lng?: number }>({});
  const [geoStatus, setGeoStatus] = useState<string>('Detecting location...');
  const [isTriggering, setIsTriggering] = useState(false);
  const [confirmTrigger, setConfirmTrigger] = useState(false);

  useEffect(() => {
    const isMounted = { current: true };
    const loadData = async () => {
      try {
        const [alerts, dir] = await Promise.all([
          sosApi.getStudentSosAlerts(),
          sosApi.getEmergencyDirectory(),
        ]);
        if (isMounted.current) {
          setActiveAlerts(alerts.filter((a) => a.status === 'ACTIVE' || a.status === 'ACKNOWLEDGED'));
          setContacts(dir);
        }
      } catch {
        // ignore
      } finally {
        if (isMounted.current) setLoading(false);
      }
    };

    loadData();

    // Auto detect geolocation
    if (typeof navigator !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          if (isMounted.current) {
            setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
            setGeoStatus(`GPS: ${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}`);
          }
        },
        () => {
          if (isMounted.current) {
            setGeoStatus('GPS Unavailable (Provide location below)');
          }
        }
      );
    }
    return () => {
      isMounted.current = false;
    };
  }, []);

  const handleTriggerSos = async () => {
    const locString = location.trim() || 'Location Access Denied / Custom Entry';

    try {
      setIsTriggering(true);
      const res = await sosApi.triggerSos({
        emergencyType,
        location: locString,
        latitude: coords.lat,
        longitude: coords.lng,
      });

      const newAlert: SosRecord = {
        id: res?.id || `sos_${Date.now()}`,
        emergencyType,
        location: locString,
        latitude: coords.lat,
        longitude: coords.lng,
        status: 'ACTIVE',
        triggeredAt: new Date().toLocaleTimeString(),
      };
      setActiveAlerts((prev) => [newAlert, ...prev]);
      setConfirmTrigger(false);
    } catch {
      // Failure -> Save to localStorage retry queue with idempotency key
      const idempotencyKey = createIdempotencyKey();
      const retryItem = {
        idempotencyKey,
        emergencyType,
        location: locString,
        latitude: coords.lat,
        longitude: coords.lng,
        timestamp: new Date().toISOString(),
      };

      const existingQueue = JSON.parse(localStorage.getItem('cms_sos_retry_queue') || '[]');
      existingQueue.push(retryItem);
      localStorage.setItem('cms_sos_retry_queue', JSON.stringify(existingQueue));

      const newOfflineAlert: SosRecord = {
        id: `sos_queued_${Date.now()}`,
        emergencyType,
        location: `${locString} (Queued for Retry)`,
        latitude: coords.lat,
        longitude: coords.lng,
        status: 'ACTIVE',
        triggeredAt: new Date().toLocaleTimeString(),
      };
      setActiveAlerts((prev) => [newOfflineAlert, ...prev]);
      setConfirmTrigger(false);
    } finally {
      setIsTriggering(false);
    }
  };

  const handleCancelSos = async (id: string) => {
    try {
      await sosApi.cancelSos(id);
    } catch {
      // ignore
    } finally {
      setActiveAlerts((prev) => prev.filter((a) => a.id !== id));
    }
  };

  return (
    <div className="space-y-6">
      <MockBanner />

      {/* Header */}
      <div className="border-b pb-4">
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <ShieldAlert className="h-6 w-6 text-red-500" />
          <span>Campus Emergency & SOS Control</span>
        </h1>
        <p className="text-sm text-muted-foreground">
          Immediate panic alert dispatch to hostel wardens, security control room, and medical desk.
        </p>
      </div>

      {/* Active SOS Warning Banner */}
      {activeAlerts.length > 0 && (
        <div className="p-5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-500 space-y-3 animate-pulse">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 font-bold text-base">
              <AlertOctagon className="h-6 w-6" />
              <span>ACTIVE EMERGENCY SOS DISPATCHED</span>
            </div>
            <span className="px-2 py-0.5 text-xs rounded bg-red-500 text-white font-bold">LIVE</span>
          </div>

          {activeAlerts.map((alert) => (
            <div key={alert.id} className="bg-background/80 p-3 rounded-lg text-xs text-foreground space-y-1">
              <div className="flex justify-between font-bold">
                <span>Type: {alert.emergencyType}</span>
                <span className="text-muted-foreground">{alert.triggeredAt}</span>
              </div>
              <p>Location: {alert.location}</p>
              {alert.acknowledgedBy && (
                <p className="text-emerald-500 font-semibold">
                  Status: Acknowledged by {alert.acknowledgedBy}
                </p>
              )}
              <div className="pt-2 flex justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleCancelSos(alert.id)}
                  className="text-xs border-red-500 text-red-500 hover:bg-red-500/10 h-7"
                >
                  <XCircle className="h-3.5 w-3.5 mr-1" />
                  Cancel SOS (False Alarm)
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Main Trigger Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Huge Trigger Button Card */}
        <div className="border rounded-xl p-6 bg-card space-y-6 flex flex-col items-center justify-center text-center">
          <div className="space-y-1">
            <h2 className="text-lg font-bold text-foreground">Tap to Dispatch Panic Alert</h2>
            <p className="text-xs text-muted-foreground">
              Notifies security officers and wardens within 5 seconds with your location.
            </p>
          </div>

          {!confirmTrigger ? (
            <button
              onClick={() => setConfirmTrigger(true)}
              className="w-44 h-44 rounded-full bg-red-500 text-white shadow-xl shadow-red-500/30 hover:bg-red-600 hover:scale-105 active:scale-95 transition-all flex flex-col items-center justify-center gap-2 border-4 border-white dark:border-gray-800"
            >
              <ShieldAlert className="h-16 w-16 animate-bounce" />
              <span className="font-extrabold text-xl tracking-wider uppercase">SOS</span>
            </button>
          ) : (
            <div className="w-full max-w-sm border-2 border-red-500 p-4 rounded-xl bg-red-500/5 space-y-4">
              <p className="text-sm font-bold text-red-500">Confirm Dispatching Panic Alert?</p>

              <div className="space-y-2 text-left">
                <div>
                  <label className="text-xs font-semibold text-foreground">Emergency Type</label>
                  <select
                    value={emergencyType}
                    onChange={(e) => setEmergencyType(e.target.value as 'MEDICAL' | 'SECURITY' | 'FIRE' | 'OTHER')}
                    className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-xs"
                  >
                    <option value="SECURITY">Security / Intruders / Violence</option>
                    <option value="MEDICAL">Medical Emergency / Illness</option>
                    <option value="FIRE">Fire Hazard / Electric Short Circuit</option>
                    <option value="OTHER">Other Urgent Danger</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-foreground">Location / Room Number</label>
                  <Input
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. Block A Room 302 / Main Library 2nd Floor"
                    required
                    className="text-xs"
                  />
                </div>

                <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                  <MapPin className="h-3.5 w-3.5 text-primary" />
                  <span>{geoStatus}</span>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <Button
                  variant="outline"
                  onClick={() => setConfirmTrigger(false)}
                  className="flex-1 text-xs"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleTriggerSos}
                  disabled={isTriggering || !location.trim()}
                  className="flex-1 bg-red-500 hover:bg-red-600 text-white text-xs font-bold"
                >
                  {isTriggering ? 'Dispatching...' : 'CONFIRM DISPATCH'}
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Emergency Contacts Directory */}
        <div className="border rounded-xl p-6 bg-card space-y-4">
          <h2 className="text-base font-bold text-foreground flex items-center gap-2">
            <PhoneCall className="h-5 w-5 text-primary" />
            <span>Campus Emergency Hotline Directory</span>
          </h2>

          {loading ? (
            <div className="text-center py-6 text-xs text-muted-foreground animate-pulse">
              Loading helpline directory...
            </div>
          ) : (
            <div className="space-y-3">
              {contacts.map((c) => (
                <div
                  key={c.id}
                  className="border rounded-lg p-3 bg-muted/30 flex items-center justify-between hover:bg-muted/50 transition-colors"
                >
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-bold text-primary uppercase">{c.category}</span>
                    <h3 className="font-bold text-foreground text-xs">{c.title}</h3>
                  </div>
                  <a
                    href={`tel:${c.phone}`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-primary text-primary-foreground font-mono text-xs font-bold hover:bg-primary/90"
                  >
                    <PhoneCall className="h-3.5 w-3.5" />
                    <span>{c.phone}</span>
                  </a>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
