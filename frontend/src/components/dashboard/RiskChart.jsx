import React from 'react';

export default function RiskChart({ data = [] }) {
  const chartData = data.length > 0 ? data : [
    { time: '12 AM', riskScore: 8 },
    { time: '1 AM', riskScore: 7 },
    { time: '2 AM', riskScore: 10 },
    { time: '3 AM', riskScore: 6 },
    { time: '4 AM', riskScore: 9 },
  ];

  const maxRisk = 100;
  const width = 600;
  const height = 180;
  const padding = 30;

  const points = chartData.map((d, index) => {
    const x = padding + (index / (chartData.length - 1 || 1)) * (width - 2 * padding);
    const y = height - padding - (d.riskScore / maxRisk) * (height - 2 * padding);
    return { x, y, ...d };
  });

  const pathD = points.reduce((acc, point, index) => {
    return index === 0 ? `M ${point.x} ${point.y}` : `${acc} L ${point.x} ${point.y}`;
  }, '');

  const areaD = pathD ? `${pathD} L ${points[points.length - 1].x} ${height - padding} L ${points[0].x} ${height - padding} Z` : '';

  return (
    <div className="glass-card" style={{ padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>Continuous Risk Trend</h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: 2 }}>
            Hybrid Ensemble Anomaly Risk Score (0-100) Over Time
          </p>
        </div>
        <span className="status-badge verified" style={{ fontSize: '0.7rem' }}>LIVE STREAM</span>
      </div>

      <div style={{ width: '100%', overflowX: 'auto' }}>
        <svg viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', height: 'auto', minWidth: 400 }}>
          <defs>
            <linearGradient id="riskGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--accent-cyan)" stopOpacity="0.3" />
              <stop offset="100%" stopColor="var(--accent-cyan)" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          <line x1={padding} y1={padding} x2={width - padding} y2={padding} stroke="rgba(255,255,255,0.05)" strokeDasharray="3 3" />
          <line x1={padding} y1={height / 2} x2={width - padding} y2={height / 2} stroke="rgba(255,255,255,0.05)" strokeDasharray="3 3" />
          <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="rgba(255,255,255,0.1)" />

          {/* Area fill */}
          {areaD && <path d={areaD} fill="url(#riskGradient)" />}

          {/* Line */}
          {pathD && <path d={pathD} fill="none" stroke="var(--accent-cyan)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />}

          {/* Data Points */}
          {points.map((p, i) => (
            <g key={i}>
              <circle cx={p.x} cy={p.y} r="4" fill="var(--accent-cyan)" stroke="#0a0d14" strokeWidth="2" />
              <text x={p.x} y={height - 8} textAnchor="middle" fill="var(--text-muted)" fontSize="10" fontFamily="var(--font-mono)">
                {p.time}
              </text>
              <text x={p.x} y={p.y - 10} textAnchor="middle" fill="#fff" fontSize="11" fontWeight="700">
                {p.riskScore}
              </text>
            </g>
          ))}
        </svg>
      </div>
    </div>
  );
}
