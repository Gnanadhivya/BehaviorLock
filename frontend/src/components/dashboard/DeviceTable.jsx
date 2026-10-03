import React from 'react';
import { Smartphone, Monitor } from 'lucide-react';
import EmptyState from './EmptyState';

export default function DeviceTable({ devices = [] }) {
  if (!devices || devices.length === 0) {
    return <EmptyState title="No Additional Devices" message="No secondary devices registered to this session." type="devices" />;
  }

  return (
    <div className="glass-card" style={{ padding: 24 }}>
      <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: 16 }}>Authorized Devices</h3>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-color)', fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              <th style={{ padding: '10px 12px' }}>Device</th>
              <th style={{ padding: '10px 12px' }}>Browser</th>
              <th style={{ padding: '10px 12px' }}>OS</th>
              <th style={{ padding: '10px 12px' }}>Last Active</th>
              <th style={{ padding: '10px 12px' }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {devices.map((device, idx) => (
              <tr key={device.id || idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', fontSize: '0.85rem' }}>
                <td style={{ padding: '12px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 10 }}>
                  {device.name?.toLowerCase().includes('phone') ? <Smartphone size={16} color="var(--accent-cyan)" /> : <Monitor size={16} color="var(--accent-cyan)" />}
                  {device.name || 'Current Device'}
                </td>
                <td style={{ padding: '12px', color: 'var(--text-secondary)' }}>{device.browser}</td>
                <td style={{ padding: '12px', color: 'var(--text-secondary)' }}>{device.os}</td>
                <td style={{ padding: '12px', color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono)', fontSize: '0.78rem' }}>{device.lastActive}</td>
                <td style={{ padding: '12px' }}>
                  <span className="status-badge verified" style={{ fontSize: '0.68rem' }}>{device.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
