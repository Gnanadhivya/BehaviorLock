import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { ShieldAlert, KeyRound, Lock, LogOut, AlertTriangle, CheckCircle2, Loader2 } from 'lucide-react';

export default function ReauthenticatePage() {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [attemptsRemaining, setAttemptsRemaining] = useState(3);
  const [isLocked, setIsLocked] = useState(false);

  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleReauthenticate = async (e) => {
    e.preventDefault();
    if (!password) {
      setError("Please enter your password to verify identity.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await api.post('/api/security/reauthenticate', { password });
      const data = res.data;

      if (data.success) {
        // Re-authentication successful
        navigate('/dashboard', { replace: true });
      } else {
        if (data.state === 'LOCKED' || data.attemptsRemaining === 0) {
          setIsLocked(true);
          setError("Maximum re-authentication attempts exceeded. Session locked.");
          setTimeout(() => {
            logout();
            navigate('/login?locked=true', { replace: true });
          }, 2500);
        } else {
          setAttemptsRemaining(data.attemptsRemaining);
          setError(data.message || "Invalid password. Re-authentication failed.");
        }
      }
    } catch (err) {
      console.error("Re-authentication error:", err);
      const errMsg = err.response?.data?.message || err.response?.data?.detail || "Re-authentication failed. Please check your password.";
      setError(errMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelSignOut = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg-dark)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px'
    }}>
      <div className="glass-card" style={{ maxWidth: 480, width: '100%', padding: '36px', borderTop: '4px solid var(--accent-rose)' }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{
            width: 64,
            height: 64,
            borderRadius: '50%',
            background: 'rgba(244,63,94,0.15)',
            color: 'var(--accent-rose)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px auto',
            border: '1px solid rgba(244,63,94,0.3)'
          }}>
            {isLocked ? <Lock size={32} /> : <ShieldAlert size={32} />}
          </div>

          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fff' }}>
            {isLocked ? 'Session Locked' : 'Additional Verification Required'}
          </h2>

          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: 8, lineHeight: 1.5 }}>
            Your recent behavioral pattern differs significantly from your normal session baseline. Please re-enter your account password to verify your identity.
          </p>
        </div>

        {error && (
          <div style={{
            background: 'rgba(244,63,94,0.12)',
            border: '1px solid rgba(244,63,94,0.3)',
            color: 'var(--accent-rose)',
            padding: '12px 16px',
            borderRadius: 8,
            fontSize: '0.85rem',
            marginBottom: 20,
            display: 'flex',
            alignItems: 'center',
            gap: 10
          }}>
            <AlertTriangle size={18} style={{ shrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        {!isLocked && (
          <form onSubmit={handleReauthenticate} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)' }}>Account Password</label>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: attemptsRemaining === 1 ? 'var(--accent-rose)' : 'var(--accent-cyan)' }}>
                  {attemptsRemaining} attempt{attemptsRemaining > 1 ? 's' : ''} remaining
                </span>
              </div>
              <div style={{ position: 'relative' }}>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password..."
                  disabled={loading}
                  style={{
                    width: '100%',
                    padding: '12px 14px 12px 40px',
                    borderRadius: 8,
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid var(--border-color)',
                    color: '#fff',
                    fontSize: '0.9rem'
                  }}
                />
                <KeyRound size={18} color="var(--text-muted)" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                padding: '12px',
                borderRadius: 8,
                background: 'var(--accent-cyan)',
                color: '#0a0d14',
                fontWeight: 700,
                fontSize: '0.9rem',
                border: 'none',
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                marginTop: 6
              }}
            >
              {loading ? <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> : <CheckCircle2 size={18} />}
              Verify Identity & Resume Session
            </button>
          </form>
        )}

        <div style={{ marginTop: 24, paddingTop: 16, borderTop: '1px solid var(--border-color)', textAlign: 'center' }}>
          <button
            onClick={handleCancelSignOut}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-muted)',
              fontSize: '0.82rem',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6
            }}
          >
            <LogOut size={14} /> Cancel & Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}
