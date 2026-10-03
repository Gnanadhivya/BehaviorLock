import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Shield, LayoutDashboard, Activity, HardDrive, Bell, Lock, User, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Behavior Monitor', path: '/monitor', icon: Activity },
    { name: 'Activities', path: '/activities', icon: Activity },
    { name: 'Devices', path: '/devices', icon: HardDrive },
    { name: 'Alerts', path: '/alerts', icon: Bell },
    { name: 'Security', path: '/security', icon: Lock },
    { name: 'Profile', path: '/profile', icon: User },
  ];

  return (
    <aside style={{
      width: 260,
      background: 'rgba(10, 13, 20, 0.95)',
      borderRight: '1px solid var(--border-color)',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      padding: '24px 16px',
      position: 'sticky',
      top: 0,
      height: '100vh',
      zIndex: 90
    }}>
      <div>
        {/* Brand Header */}
        <Link to="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '0 8px 24px 8px', textDecoration: 'none', borderBottom: '1px solid var(--border-color)', marginBottom: 20 }}>
          <div style={{
            background: 'linear-gradient(135deg, #00e5ff 0%, #a855f7 100%)',
            padding: 8,
            borderRadius: 10,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 15px rgba(0, 229, 255, 0.4)'
          }}>
            <Shield size={20} color="#0a0d14" strokeWidth={2.5} />
          </div>
          <div>
            <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#fff', letterSpacing: '-0.02em' }}>
              Behavior<span style={{ color: 'var(--accent-cyan)' }}>Lock</span>
            </div>
            <div style={{ fontSize: '0.62rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Continuous Web Auth
            </div>
          </div>
        </Link>

        {/* Navigation Items */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '10px 14px',
                  borderRadius: 10,
                  fontSize: '0.88rem',
                  fontWeight: active ? 700 : 500,
                  color: active ? 'var(--accent-cyan)' : 'var(--text-secondary)',
                  background: active ? 'rgba(0, 229, 255, 0.1)' : 'transparent',
                  border: active ? '1px solid rgba(0, 229, 255, 0.2)' : '1px solid transparent',
                  textDecoration: 'none',
                  transition: 'all 0.2s ease'
                }}
              >
                <Icon size={18} color={active ? 'var(--accent-cyan)' : 'var(--text-muted)'} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* User Information & Logout Button at Bottom */}
      <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12, padding: '0 4px' }}>
          <div style={{ background: 'rgba(255,255,255,0.06)', padding: 8, borderRadius: '50%', color: 'var(--accent-cyan)' }}>
            <User size={18} />
          </div>
          <div style={{ overflow: 'hidden' }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {user?.name || 'Authenticated User'}
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {user?.email || 'user@behaviorlock.io'}
            </div>
          </div>
        </div>

        <button
          onClick={handleLogout}
          style={{
            width: '100%',
            padding: '8px 12px',
            borderRadius: 8,
            fontSize: '0.82rem',
            fontWeight: 600,
            color: 'var(--accent-rose)',
            background: 'rgba(244, 63, 94, 0.1)',
            border: '1px solid rgba(244, 63, 94, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            cursor: 'pointer'
          }}
        >
          <LogOut size={14} /> Logout
        </button>
      </div>
    </aside>
  );
}
