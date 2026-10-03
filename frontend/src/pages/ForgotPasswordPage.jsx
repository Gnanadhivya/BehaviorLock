import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, KeyRound, ArrowLeft } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSent(true);
  };

  return (
    <div style={{ maxWidth: 440, margin: '60px auto', padding: 24 }}>
      <div className="glass-card" style={{ padding: 36 }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ background: 'rgba(245,158,11,0.1)', padding: 12, borderRadius: '50%', width: 52, height: 52, margin: '0 auto 16px auto', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-amber)' }}>
            <KeyRound size={24} />
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Reset Password</h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: 6 }}>Enter your email to receive a secure recovery token</p>
        </div>

        {sent ? (
          <div style={{ textAlign: 'center', background: 'rgba(16,185,129,0.1)', padding: 20, borderRadius: 10, border: '1px solid rgba(16,185,129,0.3)' }}>
            <p style={{ color: 'var(--accent-emerald)', fontWeight: 600, fontSize: '0.95rem' }}>Recovery Email Dispatched!</p>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: 8 }}>Check {email} for instructions to reset your password.</p>
            <Link to="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 16, fontSize: '0.85rem', fontWeight: 600 }}>
              <ArrowLeft size={16} /> Back to login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: 6, fontWeight: 600 }}>Email Address</label>
              <div style={{ position: 'relative' }}>
                <input 
                  type="email" 
                  required 
                  placeholder="alex@company.com" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{ width: '100%', padding: '12px 14px 12px 40px', borderRadius: 8, background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border-color)', color: '#fff', fontSize: '0.9rem' }}
                />
                <Mail size={16} style={{ position: 'absolute', left: 14, top: 14, color: 'var(--text-muted)' }} />
              </div>
            </div>

            <button type="submit" style={{ padding: 12, borderRadius: 8, background: 'var(--accent-amber)', color: '#0a0d14', fontWeight: 700, fontSize: '0.9rem' }}>
              Send Recovery Link
            </button>

            <Link to="/login" style={{ textAlign: 'center', fontSize: '0.82rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 8 }}>
              <ArrowLeft size={14} /> Back to Login
            </Link>
          </form>
        )}
      </div>
    </div>
  );
}
