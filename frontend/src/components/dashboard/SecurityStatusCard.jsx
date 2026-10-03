import React from 'react';
import { ShieldCheck, Eye, AlertTriangle, RefreshCw, Lock } from 'lucide-react';

export default function SecurityStatusCard({ status = "VERIFIED" }) {
  const getStatusDetails = (st) => {
    switch (st) {
      case 'VERIFIED':
        return {
          label: 'VERIFIED',
          color: 'var(--accent-emerald)',
          bg: 'rgba(16,185,129,0.12)',
          border: 'rgba(16,185,129,0.3)',
          icon: ShieldCheck,
          desc: 'Behavioral dynamics strictly align with baseline profile.'
        };
      case 'MONITORING':
        return {
          label: 'MONITORING',
          color: 'var(--accent-amber)',
          bg: 'rgba(245,158,11,0.12)',
          border: 'rgba(245,158,11,0.3)',
          icon: Eye,
          desc: 'Minor telemetry fluctuations observed. Enhanced sampling active.'
        };
      case 'SUSPICIOUS':
        return {
          label: 'SUSPICIOUS',
          color: 'var(--accent-rose)',
          bg: 'rgba(244,63,94,0.12)',
          border: 'rgba(244,63,94,0.3)',
          icon: AlertTriangle,
          desc: 'Significant anomaly detected in typing or mouse dynamics.'
        };
      case 'REAUTH_REQUIRED':
        return {
          label: 'REAUTH REQUIRED',
          color: '#f87171',
          bg: 'rgba(239,68,68,0.2)',
          border: 'rgba(239,68,68,0.5)',
          icon: RefreshCw,
          desc: 'Risk threshold exceeded. Step-up re-authentication triggered.'
        };
      case 'LOCKED':
        return {
          label: 'SESSION LOCKED',
          color: '#ef4444',
          bg: 'rgba(220,38,38,0.3)',
          border: 'rgba(220,38,38,0.6)',
          icon: Lock,
          desc: 'Unauthorized session activity. Access revoked for security.'
        };
      default:
        return {
          label: 'VERIFIED',
          color: 'var(--accent-emerald)',
          bg: 'rgba(16,185,129,0.12)',
          border: 'rgba(16,185,129,0.3)',
          icon: ShieldCheck,
          desc: 'Behavioral dynamics strictly align with baseline profile.'
        };
    }
  };

  const details = getStatusDetails(status);
  const Icon = details.icon;

  return (
    <div className="glass-card" style={{ padding: 24, borderLeft: `4px solid ${details.color}` }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
        <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Security Status</span>
        <div style={{ background: details.bg, padding: 8, borderRadius: 10, color: details.color }}>
          <Icon size={20} />
        </div>
      </div>

      <div style={{
        display: 'inline-block',
        padding: '6px 14px',
        borderRadius: 8,
        background: details.bg,
        border: `1px solid ${details.border}`,
        color: details.color,
        fontWeight: 800,
        fontSize: '1.1rem',
        letterSpacing: '0.05em',
        marginBottom: 10
      }}>
        {details.label}
      </div>

      <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
        {details.desc}
      </p>
    </div>
  );
}
