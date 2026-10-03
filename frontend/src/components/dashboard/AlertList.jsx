import React from 'react';
import { AlertTriangle, ShieldCheck } from 'lucide-react';
import EmptyState from './EmptyState';

export default function AlertList({ alerts = [] }) {
  if (!alerts || alerts.length === 0) {
    return (
      <EmptyState
        title="No Security Alerts Detected"
        message="Zero suspicious behavior detected in the current continuous authentication session."
        type="alerts"
      />
    );
  }

  return (
    <div className="glass-card" style={{ padding: 24 }}>
      <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: 16 }}>Recent Security Alerts</h3>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {alerts.map((alert, idx) => (
          <div key={alert.id || idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.02)', padding: 14, borderRadius: 10, border: '1px solid var(--border-color)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ background: 'rgba(245,158,11,0.1)', padding: 8, borderRadius: 8, color: 'var(--accent-amber)' }}>
                <AlertTriangle size={18} />
              </div>
              <div>
                <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#fff' }}>{alert.type}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2, fontFamily: 'var(--font-mono)' }}>{alert.timestamp}</div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontSize: '0.78rem', color: alert.riskScore > 50 ? 'var(--accent-rose)' : 'var(--accent-amber)', fontWeight: 700 }}>
                Risk: {alert.riskScore}
              </span>
              <span className="status-badge verified" style={{ fontSize: '0.68rem' }}>{alert.status}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
