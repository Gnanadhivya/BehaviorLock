import React from 'react';
import { User, Mail, Shield, Key, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const displayName = user?.name || 'Authenticated User';
  const displayEmail = user?.email || 'user@behaviorlock.io';
  const displayRole = user?.role || 'STUDENT';

  return (
    <div style={{ maxWidth: 640, margin: '40px auto', padding: 24 }}>
      <div className="glass-card" style={{ padding: 36 }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ background: 'linear-gradient(135deg, #00e5ff 0%, #a855f7 100%)', padding: 16, borderRadius: '50%', width: 72, height: 72, margin: '0 auto 16px auto', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0a0d14' }}>
            <User size={36} />
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>{displayName}</h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: 4 }}>{displayEmail}</p>
          <span className="status-badge verified" style={{ marginTop: 12 }}>Continuous Behavioral Protection Active</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, borderTop: '1px solid var(--border-color)', paddingTop: 24, marginBottom: 28 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
            <span style={{ color: 'var(--text-secondary)' }}>User ID</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>#{user?.id || '101'}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Role</span>
            <span style={{ fontWeight: 700, color: 'var(--accent-cyan)' }}>{displayRole}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Authentication Method</span>
            <span style={{ fontWeight: 600 }}>BCrypt Password + JWT</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Baseline Status</span>
            <span style={{ color: 'var(--accent-emerald)', fontWeight: 700 }}>TRAINED (120 Samples)</span>
          </div>
        </div>

        <button 
          onClick={handleLogout}
          style={{ width: '100%', padding: 12, borderRadius: 8, background: 'rgba(244,63,94,0.15)', border: '1px solid rgba(244,63,94,0.4)', color: 'var(--accent-rose)', fontWeight: 700, fontSize: '0.9rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
        >
          <LogOut size={16} /> Sign Out & Terminate Session
        </button>
      </div>
    </div>
  );
}
