import React, { useState } from 'react';
import { Activity, Clock, Shield, Search, Filter } from 'lucide-react';

export default function ActivitiesPage() {
  const [activities] = useState([
    { id: 1, time: '2026-09-22 23:20:14', event: 'Telemetry Window Evaluated', riskScore: 12, trustScore: 88, status: 'VERIFIED', details: 'Normal mouse & keyboard dynamics' },
    { id: 2, time: '2026-09-22 23:19:44', event: 'Telemetry Window Evaluated', riskScore: 15, trustScore: 85, status: 'VERIFIED', details: 'Normal scroll dynamics' },
    { id: 3, time: '2026-09-22 23:15:10', event: 'User Login Authenticated', riskScore: 0, trustScore: 100, status: 'VERIFIED', details: 'JWT session issued via BCrypt credentials' },
  ]);

  return (
    <div style={{ maxWidth: 1280, margin: '0 auto', padding: '32px 24px' }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 800 }}>Behavioral Activity Log</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: 4 }}>
          Comprehensive audit trail of continuous evaluation windows and risk assessments
        </p>
      </div>

      <div className="glass-card" style={{ padding: 24 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-color)', fontSize: '0.82rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              <th style={{ padding: '12px 16px' }}>Timestamp</th>
              <th style={{ padding: '12px 16px' }}>Event Description</th>
              <th style={{ padding: '12px 16px' }}>Risk Score</th>
              <th style={{ padding: '12px 16px' }}>Trust Score</th>
              <th style={{ padding: '12px 16px' }}>Status</th>
              <th style={{ padding: '12px 16px' }}>Telemetry Summary</th>
            </tr>
          </thead>
          <tbody>
            {activities.map((act) => (
              <tr key={act.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', fontSize: '0.88rem' }}>
                <td style={{ padding: '16px', fontFamily: 'var(--font-mono)', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>{act.time}</td>
                <td style={{ padding: '16px', fontWeight: 600 }}>{act.event}</td>
                <td style={{ padding: '16px', color: act.riskScore > 50 ? 'var(--accent-rose)' : 'var(--accent-emerald)', fontWeight: 700 }}>{act.riskScore}</td>
                <td style={{ padding: '16px', color: 'var(--accent-cyan)', fontWeight: 700 }}>{act.trustScore}</td>
                <td style={{ padding: '16px' }}><span className="status-badge verified">{act.status}</span></td>
                <td style={{ padding: '16px', color: 'var(--text-secondary)', fontSize: '0.82rem' }}>{act.details}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
