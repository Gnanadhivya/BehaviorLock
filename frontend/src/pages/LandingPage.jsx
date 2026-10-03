import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Lock, Cpu, EyeOff, Activity, CheckCircle, Zap } from 'lucide-react';

export default function LandingPage() {
  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '60px 24px' }}>
      {/* Hero Section */}
      <div style={{ textAlign: 'center', marginBottom: 80 }}>
        <div className="status-badge verified" style={{ marginBottom: 20 }}>
          <Shield size={14} /> Zero-Text Continuous Behavioral Authentication
        </div>
        <h1 style={{ fontSize: '3.5rem', fontWeight: 800, lineHeight: 1.1, marginBottom: 24, letterSpacing: '-0.03em' }}>
          Continuous Web Security <br />
          <span style={{ background: 'linear-gradient(135deg, #00e5ff 0%, #a855f7 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Without Capturing Text or Mouse Streams
          </span>
        </h1>
        <p style={{ fontSize: '1.25rem', color: 'var(--text-secondary)', maxWidth: 780, margin: '0 auto 36px auto', lineHeight: 1.6 }}>
          BehaviorLock monitors continuous behavioral signals post-login using an ensemble of <strong>Isolation Forest</strong> and <strong>One-Class SVM</strong> to detect session hijacking and insider threats without ever reading keystrokes or passwords.
        </p>

        <div style={{ display: 'flex', gap: 16, justifyContent: 'center' }}>
          <Link to="/register" style={{ padding: '14px 28px', borderRadius: 10, fontSize: '1rem', fontWeight: 700, color: '#0a0d14', background: 'var(--accent-cyan)', boxShadow: '0 0 20px rgba(0, 229, 255, 0.4)' }}>
            Launch Demo Dashboard
          </Link>
          <Link to="/monitor" style={{ padding: '14px 28px', borderRadius: 10, fontSize: '1rem', fontWeight: 600, color: '#fff', border: '1px solid var(--border-color)', background: 'rgba(255,255,255,0.03)' }}>
            View Real-Time Behavioral Monitor
          </Link>
        </div>
      </div>

      {/* 3 Core Architecture Pillars */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 24, marginBottom: 80 }}>
        <div className="glass-card" style={{ padding: 32 }}>
          <div style={{ background: 'rgba(0,229,255,0.1)', padding: 12, borderRadius: 12, width: 'fit-content', color: 'var(--accent-cyan)', marginBottom: 20 }}>
            <EyeOff size={28} />
          </div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: 12 }}>Strict Privacy Preservation</h3>
          <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, fontSize: '0.95rem' }}>
            Zero typed characters, passwords, key codes, or raw mouse paths are transmitted or logged. Aggregated 28D statistical summaries are computed strictly in-browser.
          </p>
        </div>

        <div className="glass-card" style={{ padding: 32 }}>
          <div style={{ background: 'rgba(168,85,247,0.1)', padding: 12, borderRadius: 12, width: 'fit-content', color: 'var(--accent-purple)', marginBottom: 20 }}>
            <Cpu size={28} />
          </div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: 12 }}>Hybrid Anomaly Ensemble</h3>
          <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, fontSize: '0.95rem' }}>
            Powered by a dual equal 0.5/0.5 ensemble of Isolation Forest (n_estimators=200) and One-Class SVM (nu=0.05) hosted on a Python FastAPI ML engine.
          </p>
        </div>

        <div className="glass-card" style={{ padding: 32 }}>
          <div style={{ background: 'rgba(16,185,129,0.1)', padding: 12, borderRadius: 12, width: 'fit-content', color: 'var(--accent-emerald)', marginBottom: 20 }}>
            <Activity size={28} />
          </div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: 12 }}>Adaptive Risk State Machine</h3>
          <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, fontSize: '0.95rem' }}>
            Dynamically shifts session state: VERIFIED (0-29) → MONITOR (30-59) → SUSPICIOUS (60-84) → REAUTH_REQUIRED / UNAUTHORIZED (85-100).
          </p>
        </div>
      </div>
    </div>
  );
}
