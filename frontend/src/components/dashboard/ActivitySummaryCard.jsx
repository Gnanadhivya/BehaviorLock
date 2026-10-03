import React from 'react';
import { Activity, Clock, Eye, MousePointer, Scroll, Cpu } from 'lucide-react';

export default function ActivitySummaryCard({
  todayActivities = 148,
  activeSessionTime = "42m",
  focusChanges = 2,
  mouseInteractions = "4.2k",
  scrollEvents = 18,
  analysisWindows = 48
}) {
  const stats = [
    { label: "Today's Activities", val: todayActivities, icon: Activity, color: 'var(--accent-cyan)' },
    { label: "Active Session Time", val: activeSessionTime, icon: Clock, color: 'var(--accent-emerald)' },
    { label: "Focus Changes", val: focusChanges, icon: Eye, color: 'var(--accent-purple)' },
    { label: "Mouse Movements", val: mouseInteractions, icon: MousePointer, color: '#38bdf8' },
    { label: "Scroll Events", val: scrollEvents, icon: Scroll, color: 'var(--accent-amber)' },
    { label: "Telemetry Windows", val: analysisWindows, icon: Cpu, color: '#a7f3d0' },
  ];

  return (
    <div className="glass-card" style={{ padding: 24 }}>
      <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: 16 }}>Activity & Interaction Summary</h3>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
        {stats.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div key={idx} style={{ background: 'rgba(255,255,255,0.03)', padding: 14, borderRadius: 10, border: '1px solid var(--border-color)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <Icon size={16} color={item.color} />
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>{item.label}</span>
              </div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff' }}>
                {item.val}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
