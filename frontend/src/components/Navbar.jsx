import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Shield, User, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="glass-nav" style={{ position: 'sticky', top: 0, zIndex: 100, padding: '12px 24px' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        {/* Brand Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <div style={{
            background: 'linear-gradient(135deg, #00e5ff 0%, #a855f7 100%)',
            padding: 8,
            borderRadius: 10,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 15px rgba(0, 229, 255, 0.4)'
          }}>
            <Shield size={22} color="#0a0d14" strokeWidth={2.5} />
          </div>
          <div>
            <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff', letterSpacing: '-0.02em' }}>
              Behavior<span style={{ color: 'var(--accent-cyan)' }}>Lock</span>
            </span>
            <span style={{ display: 'block', fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Zero-Text Continuous Auth
            </span>
          </div>
        </Link>

        {/* Primary Navigation Items */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.03)', padding: '4px 8px', borderRadius: 12, border: '1px solid var(--border-color)' }}>
          <Link to="/" style={{ padding: '6px 12px', borderRadius: 8, fontSize: '0.85rem', fontWeight: 500, color: isActive('/') ? 'var(--accent-cyan)' : 'var(--text-secondary)', background: isActive('/') ? 'rgba(0,229,255,0.1)' : 'transparent' }}>
            Home
          </Link>
          {isAuthenticated && (
            <>
              <Link to="/dashboard" style={{ padding: '6px 12px', borderRadius: 8, fontSize: '0.85rem', fontWeight: 500, color: isActive('/dashboard') ? 'var(--accent-cyan)' : 'var(--text-secondary)', background: isActive('/dashboard') ? 'rgba(0,229,255,0.1)' : 'transparent' }}>
                Dashboard
              </Link>
              <Link to="/monitor" style={{ padding: '6px 12px', borderRadius: 8, fontSize: '0.85rem', fontWeight: 500, color: isActive('/monitor') ? 'var(--accent-cyan)' : 'var(--text-secondary)', background: isActive('/monitor') ? 'rgba(0,229,255,0.1)' : 'transparent' }}>
                Monitor
              </Link>
              <Link to="/activities" style={{ padding: '6px 12px', borderRadius: 8, fontSize: '0.85rem', fontWeight: 500, color: isActive('/activities') ? 'var(--accent-cyan)' : 'var(--text-secondary)', background: isActive('/activities') ? 'rgba(0,229,255,0.1)' : 'transparent' }}>
                Activities
              </Link>
              <Link to="/devices" style={{ padding: '6px 12px', borderRadius: 8, fontSize: '0.85rem', fontWeight: 500, color: isActive('/devices') ? 'var(--accent-cyan)' : 'var(--text-secondary)', background: isActive('/devices') ? 'rgba(0,229,255,0.1)' : 'transparent' }}>
                Devices
              </Link>
              <Link to="/alerts" style={{ padding: '6px 12px', borderRadius: 8, fontSize: '0.85rem', fontWeight: 500, color: isActive('/alerts') ? 'var(--accent-cyan)' : 'var(--text-secondary)', background: isActive('/alerts') ? 'rgba(0,229,255,0.1)' : 'transparent' }}>
                Alerts
              </Link>
              <Link to="/security" style={{ padding: '6px 12px', borderRadius: 8, fontSize: '0.85rem', fontWeight: 500, color: isActive('/security') ? 'var(--accent-cyan)' : 'var(--text-secondary)', background: isActive('/security') ? 'rgba(0,229,255,0.1)' : 'transparent' }}>
                Security
              </Link>
            </>
          )}
        </div>

        {/* User Auth Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {isAuthenticated ? (
            <>
              <Link to="/profile" style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 12px', borderRadius: 8, background: 'rgba(255,255,255,0.05)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', textDecoration: 'none', fontSize: '0.85rem', fontWeight: 600 }}>
                <User size={16} color="var(--accent-cyan)" /> {user?.name || 'Profile'}
              </Link>
              <button 
                onClick={handleLogout}
                style={{ padding: '8px 12px', borderRadius: 8, fontSize: '0.82rem', fontWeight: 600, color: 'var(--accent-rose)', border: '1px solid rgba(244,63,94,0.3)', background: 'rgba(244,63,94,0.1)', display: 'flex', alignItems: 'center', gap: 6 }}
              >
                <LogOut size={14} /> Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" style={{ padding: '8px 16px', borderRadius: 8, fontSize: '0.85rem', fontWeight: 600, color: '#fff', border: '1px solid var(--border-color)', background: 'transparent' }}>
                Login
              </Link>
              <Link to="/register" style={{ padding: '8px 16px', borderRadius: 8, fontSize: '0.85rem', fontWeight: 600, color: '#0a0d14', background: 'var(--accent-cyan)', boxShadow: '0 0 12px rgba(0,229,255,0.3)' }}>
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
