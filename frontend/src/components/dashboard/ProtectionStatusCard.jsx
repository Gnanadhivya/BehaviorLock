import React from 'react';
import { Shield, Clock, RefreshCw } from 'lucide-react';

export default function ProtectionStatusCard({ active = true, sessionDuration = "42 minutes", lastAnalysis = "Just now" }) {
  return (
    <div className="glass-card" style={{ padding: 24, position: 'relative', overflow: 'hidden' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ width: 12, height: 12, borderRadius: '50%', background: 'var(--accent-emerald)', display: 'inline-block' }}></span>
            <span style={{ position: 'absolute', width: 20, height: 20, borderRadius: '50%', background: 'rgba(16,185,129,0.3)', animation: 'pulse-danger 2s infinite' }}></span>
          </div>
          <div>
            <h3 style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Continuous Protection</h3>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--accent-emerald)', marginTop: 2 }}>ACTIVE</div>
          </div>
        </div>

        <div style={{ background: 'rgba(16,185,129,0.1)', padding: 10, borderRadius: 12, color: 'var(--accent-emerald)' }}>
          <Shield size={22} />
        </div>
      </div>

      <p style={{ fontSize: '0.88rem', color: '#fff', fontWeight: 600, marginBottom: 16 }}>
        Your session is continuously monitored
      </p>

      <div style={{ display: 'flex', gap: 20, fontSize: '0.78rem', color: 'var(--text-secondary)', borderTop: '1px solid var(--border-color)', paddingTop: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Clock size={14} color="var(--text-muted)" />
          <span>Session: <strong style={{ color: '#fff' }}>{sessionDuration}</strong></span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <RefreshCw size={14} color="var(--text-muted)" />
          <span>Last Analysis: <strong style={{ color: 'var(--accent-cyan)' }}>{lastAnalysis}</strong></span>
        </div>
      </div>
    </div>
  );
}
