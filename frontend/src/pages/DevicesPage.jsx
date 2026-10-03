import React, { useState, useEffect } from 'react';
import Sidebar from '../components/dashboard/Sidebar';
import TopNavbar from '../components/dashboard/TopNavbar';
import api from '../services/api';
import { Smartphone, Monitor, Globe, Shield, Trash2, CheckCircle2, LogOut, Loader2, AlertTriangle, MonitorSmartphone } from 'lucide-react';

export default function DevicesPage() {
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [revokingId, setRevokingId] = useState(null);
  const [revokingAll, setRevokingAll] = useState(false);
  const [confirmRevokeAll, setConfirmRevokeAll] = useState(false);

  const fetchDevices = async () => {
    try {
      const res = await api.get('/api/devices');
      setDevices(res.data || []);
    } catch (err) {
      console.error("Error fetching devices:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDevices();
  }, []);

  const handleRevokeSingle = async (id) => {
    setRevokingId(id);
    try {
      await api.post(`/api/devices/${id}/revoke`);
      setDevices(devices.map(d => d.id === id ? { ...d, status: 'REVOKED', current: false } : d));
    } catch (err) {
      console.error("Error revoking device:", err);
    } finally {
      setRevokingId(null);
    }
  };

  const handleRevokeAllOther = async () => {
    setRevokingAll(true);
    try {
      await api.post('/api/devices/revoke-all');
      fetchDevices();
      setConfirmRevokeAll(false);
    } catch (err) {
      console.error("Error revoking all other devices:", err);
    } finally {
      setRevokingAll(false);
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-dark)' }}>
      <Sidebar />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <TopNavbar title="Authorized Active Devices & Multi-Device Security" />

        <div style={{ padding: '28px 32px', flex: 1, display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Header & Revoke All Control Panel */}
          <div className="glass-card" style={{ padding: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <MonitorSmartphone size={24} color="var(--accent-cyan)" />
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Multi-Device Session Security</h2>
              </div>
              <p style={{ fontSize: '0.83rem', color: 'var(--text-secondary)', marginTop: 4 }}>
                Review privacy-preserving device fingerprints and manage active authorization sessions
              </p>
            </div>

            <button
              onClick={() => setConfirmRevokeAll(true)}
              style={{
                padding: '10px 18px',
                borderRadius: 8,
                background: 'rgba(244,63,94,0.15)',
                border: '1px solid rgba(244,63,94,0.4)',
                color: 'var(--accent-rose)',
                fontWeight: 700,
                fontSize: '0.85rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 8
              }}
            >
              <LogOut size={16} /> Sign Out of All Other Devices
            </button>
          </div>

          {/* Revoke All Confirmation Modal / Banner */}
          {confirmRevokeAll && (
            <div className="glass-card" style={{ padding: 20, borderLeft: '4px solid var(--accent-rose)', background: 'rgba(244,63,94,0.05)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <AlertTriangle size={22} color="var(--accent-rose)" />
                  <div>
                    <h4 style={{ fontSize: '0.98rem', fontWeight: 700, color: '#fff' }}>Confirm Revocation of All Other Sessions</h4>
                    <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: 2 }}>
                      This action will terminate all active authorization tokens except your current browser session.
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 10 }}>
                  <button
                    onClick={handleRevokeAllOther}
                    disabled={revokingAll}
                    style={{ padding: '8px 16px', borderRadius: 6, background: 'var(--accent-rose)', color: '#fff', fontWeight: 700, fontSize: '0.82rem', border: 'none', cursor: 'pointer' }}
                  >
                    {revokingAll ? 'Revoking...' : 'Confirm Revoke All'}
                  </button>
                  <button
                    onClick={() => setConfirmRevokeAll(false)}
                    style={{ padding: '8px 16px', borderRadius: 6, background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', color: '#fff', fontSize: '0.82rem', cursor: 'pointer' }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Devices Grid */}
          {loading ? (
            <div className="glass-card" style={{ padding: 40, textAlign: 'center', color: 'var(--accent-cyan)' }}>
              <Loader2 size={32} style={{ animation: 'spin 1s linear infinite', margin: '0 auto 12px auto' }} />
              <p style={{ fontSize: '0.88rem' }}>Loading authorized devices...</p>
            </div>
          ) : devices.length > 0 ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 20 }}>
              {devices.map((device) => (
                <div key={device.id} className="glass-card" style={{ padding: 24, position: 'relative', borderLeft: device.current ? '4px solid var(--accent-emerald)' : '1px solid var(--border-color)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ background: 'rgba(0,229,255,0.1)', padding: 10, borderRadius: 10, color: 'var(--accent-cyan)' }}>
                        {(device.name || '').includes('iPhone') || (device.name || '').includes('Android') ? <Smartphone size={22} /> : <Monitor size={22} />}
                      </div>
                      <div>
                        <h3 style={{ fontSize: '1.05rem', fontWeight: 800 }}>{device.name || device.deviceName || 'Browser Session'}</h3>
                        {device.current && (
                          <span style={{ fontSize: '0.72rem', color: 'var(--accent-emerald)', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
                            <CheckCircle2 size={12} /> Current Device Session
                          </span>
                        )}
                      </div>
                    </div>

                    <span className={`status-badge ${(device.status || 'ACTIVE').toLowerCase()}`}>
                      {device.status || 'ACTIVE'}
                    </span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: '0.83rem', color: 'var(--text-secondary)', marginBottom: 20 }}>
                    <div>Browser: <strong style={{ color: '#fff' }}>{device.browser}</strong></div>
                    <div>Operating System: <strong style={{ color: '#fff' }}>{device.os || device.operatingSystem}</strong></div>
                    {device.screenResolution && <div>Screen Resolution: <strong style={{ color: '#fff', fontFamily: 'var(--font-mono)' }}>{device.screenResolution}</strong></div>}
                    {device.timezone && <div>Timezone / Lang: <strong style={{ color: '#fff', fontFamily: 'var(--font-mono)' }}>{device.timezone} ({device.language || 'en-US'})</strong></div>}
                    <div>IP Address: <strong style={{ color: '#fff', fontFamily: 'var(--font-mono)' }}>{device.ipAddress}</strong></div>
                    <div>First Seen: <strong style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: '0.78rem' }}>{device.firstSeen}</strong></div>
                    <div>Last Active: <strong style={{ color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono)', fontSize: '0.78rem' }}>{device.lastActive}</strong></div>
                  </div>

                  {!device.current && device.status === 'ACTIVE' && (
                    <button
                      onClick={() => handleRevokeSingle(device.id)}
                      disabled={revokingId === device.id}
                      style={{
                        width: '100%',
                        padding: '10px',
                        borderRadius: 8,
                        background: 'rgba(244,63,94,0.1)',
                        border: '1px solid rgba(244,63,94,0.3)',
                        color: 'var(--accent-rose)',
                        fontWeight: 700,
                        fontSize: '0.83rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 8
                      }}
                    >
                      <Trash2 size={16} /> {revokingId === device.id ? 'Revoking Session...' : 'Revoke Device Session'}
                    </button>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="glass-card" style={{ padding: 36, textAlign: 'center', color: 'var(--text-muted)' }}>
              <Monitor size={36} color="var(--accent-cyan)" style={{ margin: '0 auto 12px auto' }} />
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#fff' }}>Primary Session Active</h3>
              <p style={{ fontSize: '0.83rem', marginTop: 4 }}>No secondary registered devices found for this account.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
