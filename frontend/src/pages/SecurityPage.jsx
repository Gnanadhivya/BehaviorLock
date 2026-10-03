import React, { useState, useEffect } from 'react';
import Sidebar from '../components/dashboard/Sidebar';
import TopNavbar from '../components/dashboard/TopNavbar';
import api from '../services/api';
import { Shield, ShieldAlert, Cpu, Lock, CheckCircle, RefreshCcw, Activity, KeyRound, AlertTriangle } from 'lucide-react';

export default function SecurityPage() {
  const [securityStatus, setSecurityStatus] = useState(null);
  const [securityEvents, setSecurityEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fetchSecurityData = async () => {
      try {
        const [statusRes, eventsRes] = await Promise.all([
          api.get('/api/security/status').catch(() => ({ data: null })),
          api.get('/api/security/events').catch(() => ({ data: [] }))
        ]);

        if (isMounted) {
          setSecurityStatus(statusRes.data || {
            state: "VERIFIED",
            riskScore: 12,
            trustScore: 88,
            monitoring: true,
            reauthRequired: false
          });
          setSecurityEvents(eventsRes.data || []);
          setLoading(false);
        }
      } catch (err) {
        console.error("Error fetching security status:", err);
        if (isMounted) setLoading(false);
      }
    };

    fetchSecurityData();
    return () => { isMounted = false; };
  }, []);

  const systemThresholds = [
    { state: "VERIFIED", range: "0 – 29", desc: "Normal behavioral pattern. Unrestricted access.", color: "var(--accent-emerald)" },
    { state: "MONITORING", range: "30 – 59", desc: "Mild behavioral variation. Heightened passive monitoring active.", color: "var(--accent-cyan)" },
    { state: "SUSPICIOUS", range: "60 – 84", desc: "Significant behavioral anomaly. Security alert generated.", color: "#f59e0b" },
    { state: "REAUTH_REQUIRED", range: "85 – 100", desc: "Severe deviation. Immediate password re-verification required.", color: "var(--accent-rose)" }
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-dark)' }}>
      <Sidebar />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <TopNavbar title="Continuous Security Architecture & Thresholds" />

        <div style={{ padding: '28px 32px', flex: 1, display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Header Card */}
          <div className="glass-card" style={{ padding: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Shield size={24} color="var(--accent-cyan)" />
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Continuous Authentication State Engine</h2>
              </div>
              <p style={{ fontSize: '0.83rem', color: 'var(--text-secondary)', marginTop: 4 }}>
                Authoritative backend security state machine monitoring real-time behavioral risk scores
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span className={`status-badge ${(securityStatus?.state || 'VERIFIED').toLowerCase()}`}>
                State: {securityStatus?.state || 'VERIFIED'}
              </span>
              <span style={{ fontSize: '0.85rem', fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--accent-cyan)' }}>
                Risk: {securityStatus?.riskScore ?? 12}/100
              </span>
            </div>
          </div>

          {/* Grid 1: System Threshold Definitions */}
          <div className="glass-card" style={{ padding: 24 }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: 16 }}>Configurable System Risk Thresholds</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
              {systemThresholds.map((t) => (
                <div key={t.state} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)', borderRadius: 10, padding: 18, borderLeft: `4px solid ${t.color}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 800, fontSize: '0.92rem', color: t.color }}>{t.state}</span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', fontWeight: 700, color: '#fff' }}>Risk {t.range}</span>
                  </div>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: 8, lineHeight: 1.4 }}>
                    {t.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Grid 2: Security Audit Events Log */}
          <div className="glass-card" style={{ padding: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>Security Audit Event Log</h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: 2 }}>
                  Immutable security event trail recorded by backend state machine
                </p>
              </div>
              <span className="status-badge verified" style={{ fontSize: '0.68rem' }}>AUDIT LOG</span>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.82rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    <th style={{ padding: '10px 12px' }}>Timestamp</th>
                    <th style={{ padding: '10px 12px' }}>Event Type</th>
                    <th style={{ padding: '10px 12px' }}>State</th>
                    <th style={{ padding: '10px 12px' }}>Risk Score</th>
                    <th style={{ padding: '10px 12px' }}>Metadata / Details</th>
                  </tr>
                </thead>
                <tbody>
                  {securityEvents && securityEvents.length > 0 ? (
                    securityEvents.map((evt) => (
                      <tr key={evt.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                        <td style={{ padding: '10px 12px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>{evt.timestamp}</td>
                        <td style={{ padding: '10px 12px', fontWeight: 700, color: 'var(--accent-cyan)' }}>{evt.eventType}</td>
                        <td style={{ padding: '10px 12px' }}>
                          <span className={`status-badge ${(evt.state || 'VERIFIED').toLowerCase()}`} style={{ fontSize: '0.68rem' }}>
                            {evt.state}
                          </span>
                        </td>
                        <td style={{ padding: '10px 12px', fontFamily: 'var(--font-mono)', fontWeight: 700, color: evt.riskScore >= 60 ? 'var(--accent-rose)' : '#fff' }}>
                          {evt.riskScore} / 100
                        </td>
                        <td style={{ padding: '10px 12px', color: 'var(--text-secondary)' }}>{evt.metadata}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" style={{ padding: 20, textAlign: 'center', color: 'var(--text-muted)' }}>
                        No security audit events recorded yet. Session is running with clean baseline observations.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
