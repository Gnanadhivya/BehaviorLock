import React from 'react';
import { Activity } from 'lucide-react';

export default function TrustScoreCard({ trustScore = 94, riskScore = 6, status = "VERIFIED" }) {
  const strokeDashoffset = 283 - (283 * trustScore) / 100;

  return (
    <div className="glass-card" style={{ padding: 24, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', marginBottom: 12 }}>
        <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Trust Score</span>
        <Activity size={18} color="var(--accent-cyan)" />
      </div>

      {/* SVG Ring Chart */}
      <div style={{ position: 'relative', width: 140, height: 140, margin: '10px 0' }}>
        <svg width="140" height="140" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8" />
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="var(--accent-cyan)"
            strokeWidth="8"
            strokeDasharray="283"
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            transform="rotate(-90 50 50)"
            style={{ transition: 'stroke-dashoffset 0.8s ease' }}
          />
        </svg>
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontSize: '2.2rem', fontWeight: 800, color: '#fff', lineHeight: 1 }}>{trustScore}</span>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600, marginTop: 2 }}>/ 100</span>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 16, marginTop: 8, fontSize: '0.82rem' }}>
        <div>Status: <strong style={{ color: 'var(--accent-emerald)' }}>{status}</strong></div>
        <div style={{ color: 'var(--border-color)' }}>|</div>
        <div>Risk Score: <strong style={{ color: riskScore > 50 ? 'var(--accent-rose)' : 'var(--accent-cyan)' }}>{riskScore} / 100</strong></div>
      </div>
    </div>
  );
}
