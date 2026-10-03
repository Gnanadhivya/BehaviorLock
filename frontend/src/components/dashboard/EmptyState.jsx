import React from 'react';
import { ShieldCheck, HardDrive, Activity, LineChart } from 'lucide-react';

export default function EmptyState({ title = "No Items", message = "No data available.", type = "general" }) {
  const getIcon = () => {
    switch (type) {
      case 'alerts': return ShieldCheck;
      case 'devices': return HardDrive;
      case 'activity': return Activity;
      case 'chart': return LineChart;
      default: return ShieldCheck;
    }
  };

  const Icon = getIcon();

  return (
    <div className="glass-card" style={{ padding: '36px 20px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ background: 'rgba(16,185,129,0.1)', padding: 14, borderRadius: '50%', color: 'var(--accent-emerald)', marginBottom: 14 }}>
        <Icon size={24} />
      </div>
      <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#fff' }}>{title}</h4>
      <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: 4, maxWidth: 300 }}>{message}</p>
    </div>
  );
}
