import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Bell, User, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function TopNavbar({ title = "Continuous Security Dashboard", alertCount = 0 }) {
  const { user } = useAuth();

  return (
    <header className="glass-nav" style={{ padding: '14px 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)' }}>
      <div>
        <h1 style={{ fontSize: '1.4rem', fontWeight: 800, letterSpacing: '-0.02em', color: '#fff' }}>{title}</h1>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        {/* Protection Status Badge */}
        <div className="status-badge verified" style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '5px 12px' }}>
          <Shield size={14} /> CONTINUOUS PROTECTION ACTIVE
        </div>

        {/* Notification Icon */}
        <Link to="/alerts" style={{ position: 'relative', padding: 8, borderRadius: '50%', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', display: 'flex' }}>
          <Bell size={18} />
          {alertCount > 0 && (
            <span style={{ position: 'absolute', top: 2, right: 2, width: 8, height: 8, borderRadius: '50%', background: 'var(--accent-rose)' }}></span>
          )}
        </Link>

        {/* Profile Avatar / Menu */}
        <Link to="/profile" style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '4px 10px 4px 6px', borderRadius: 20, background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border-color)', textDecoration: 'none' }}>
          <div style={{ background: 'var(--accent-cyan)', padding: 6, borderRadius: '50%', color: '#0a0d14', display: 'flex' }}>
            <User size={14} strokeWidth={2.5} />
          </div>
          <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#fff' }}>{user?.name || 'User'}</span>
        </Link>
      </div>
    </header>
  );
}
