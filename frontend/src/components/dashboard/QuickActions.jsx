import React from 'react';
import { Link } from 'react-router-dom';
import { Activity, FileText, HardDrive, Lock } from 'lucide-react';

export default function QuickActions() {
  const actions = [
    { title: 'View Behavior Monitor', path: '/monitor', icon: Activity, color: 'var(--accent-cyan)' },
    { title: 'View Activity Logs', path: '/activities', icon: FileText, color: 'var(--accent-emerald)' },
    { title: 'View Devices', path: '/devices', icon: HardDrive, color: '#38bdf8' },
    { title: 'Security Settings', path: '/security', icon: Lock, color: 'var(--accent-purple)' },
  ];

  return (
    <div className="glass-card" style={{ padding: 24 }}>
      <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: 16 }}>Quick Security Actions</h3>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
        {actions.map((act, idx) => {
          const Icon = act.icon;
          return (
            <Link
              key={idx}
              to={act.path}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '12px 16px',
                borderRadius: 10,
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid var(--border-color)',
                color: '#fff',
                fontSize: '0.85rem',
                fontWeight: 600,
                textDecoration: 'none',
                transition: 'all 0.2s ease'
              }}
            >
              <Icon size={18} color={act.color} />
              <span>{act.title}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
