import React from 'react';
import { Link } from 'react-router-dom';
import { MousePointer, Keyboard, Scroll, Eye, Clock, ArrowUpRight } from 'lucide-react';

export default function BehaviorCard({ type, title, status = "NORMAL", activitySummary, metricValue, metricUnit }) {
  const getIcon = () => {
    switch (type) {
      case 'mouse': return MousePointer;
      case 'typing': return Keyboard;
      case 'scroll': return Scroll;
      case 'focus': return Eye;
      case 'session': return Clock;
      default: return MousePointer;
    }
  };

  const Icon = getIcon();

  return (
    <div className="glass-card" style={{ padding: 20, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ background: 'rgba(0,229,255,0.1)', padding: 8, borderRadius: 8, color: 'var(--accent-cyan)' }}>
              <Icon size={18} />
            </div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#fff' }}>{title}</h4>
          </div>

          <span className="status-badge verified" style={{ fontSize: '0.68rem', padding: '2px 8px' }}>
            {status}
          </span>
        </div>

        <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fff', marginBottom: 4 }}>
          {metricValue} <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 500 }}>{metricUnit}</span>
        </div>

        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: 16 }}>
          {activitySummary}
        </p>
      </div>

      <Link to="/monitor" style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: '0.78rem', fontWeight: 600, color: 'var(--accent-cyan)', textDecoration: 'none' }}>
        Detailed Monitor <ArrowUpRight size={14} />
      </Link>
    </div>
  );
}
