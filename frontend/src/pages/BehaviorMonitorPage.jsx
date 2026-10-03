import React, { useState } from 'react';
import Sidebar from '../components/dashboard/Sidebar';
import TopNavbar from '../components/dashboard/TopNavbar';
import { useBehaviorCollector } from '../hooks/useBehaviorCollector';
import { startMonitoring, stopMonitoring } from '../services/behaviorService';
import { Shield, EyeOff, Activity, MousePointer, Keyboard, Scroll, Eye, Clock, Play, Square, CheckCircle, Info } from 'lucide-react';

export default function BehaviorMonitorPage() {
  const [isMonitoring, setIsMonitoring] = useState(true);
  const [windowSec] = useState(10);

  const {
    isIdle,
    windowCount,
    eventCount,
    lastAnalysisTime,
    latestResult,
    latestFeatures,
    sessionDurationSec
  } = useBehaviorCollector(windowSec, isMonitoring);

  const handleToggleMonitoring = () => {
    if (isMonitoring) {
      stopMonitoring();
      setIsMonitoring(false);
    } else {
      startMonitoring();
      setIsMonitoring(true);
    }
  };

  const featureDefinitions = [
    { idx: 1, name: "mouse_event_count", cat: "Mouse", unit: "count", desc: "Total mouse movement trajectory samples" },
    { idx: 2, name: "mouse_distance_mean", cat: "Mouse", unit: "px", desc: "Average mouse displacement between samples" },
    { idx: 3, name: "mouse_speed_mean", cat: "Mouse", unit: "px/s", desc: "Average mouse movement velocity" },
    { idx: 4, name: "mouse_speed_variance", cat: "Mouse", unit: "var", desc: "Variance in mouse movement velocity" },
    { idx: 5, name: "mouse_direction_change_rate", cat: "Mouse", unit: "changes/s", desc: "Rate of mouse direction angle changes (>30deg)" },
    
    { idx: 6, name: "click_count", cat: "Click", unit: "count", desc: "Total mouse click events in window" },
    { idx: 7, name: "click_interval_mean", cat: "Click", unit: "sec", desc: "Average interval between consecutive clicks" },
    { idx: 8, name: "click_interval_variance", cat: "Click", unit: "var", desc: "Variance in click interval distribution" },
    { idx: 9, name: "click_double_click_rate", cat: "Click", unit: "ratio", desc: "Ratio of rapid double clicks" },

    { idx: 10, name: "key_hold_mean", cat: "Typing", unit: "ms", desc: "Average duration key is held down (TIMING ONLY)" },
    { idx: 11, name: "key_hold_variance", cat: "Typing", unit: "var", desc: "Variance in key hold duration" },
    { idx: 12, name: "key_flight_mean", cat: "Typing", unit: "ms", desc: "Average flight time between key transitions" },
    { idx: 13, name: "key_flight_variance", cat: "Typing", unit: "var", desc: "Variance in key flight time" },
    { idx: 14, name: "typing_speed", cat: "Typing", unit: "WPM", desc: "Estimated typing speed based strictly on timing" },
    { idx: 15, name: "typing_speed_variance", cat: "Typing", unit: "var", desc: "Variance in inter-keystroke timing" },

    { idx: 16, name: "scroll_count", cat: "Scroll", unit: "count", desc: "Total scroll wheel/touch events" },
    { idx: 17, name: "scroll_distance_mean", cat: "Scroll", unit: "px", desc: "Average vertical scroll distance" },
    { idx: 18, name: "scroll_speed_mean", cat: "Scroll", unit: "px/s", desc: "Average vertical scroll speed" },
    { idx: 19, name: "scroll_speed_variance", cat: "Scroll", unit: "var", desc: "Variance in scroll speed" },

    { idx: 20, name: "focus_count", cat: "Focus", unit: "events", desc: "Window focus gains count" },
    { idx: 21, name: "blur_count", cat: "Focus", unit: "events", desc: "Window focus loss/blur count" },
    { idx: 22, name: "visibility_change_count", cat: "Focus", unit: "events", desc: "Tab visibility toggle count" },

    { idx: 23, name: "active_duration", cat: "Session", unit: "sec", desc: "Active duration in window" },
    { idx: 24, name: "idle_duration", cat: "Session", unit: "sec", desc: "Idle duration in window" },
    { idx: 25, name: "session_duration", cat: "Session", unit: "sec", desc: "Total session elapsed duration" },

    { idx: 26, name: "interaction_frequency", cat: "Variability", unit: "events/s", desc: "Overall interaction frequency" },
    { idx: 27, name: "activity_variance", cat: "Variability", unit: "composite", desc: "Composite variance across modalities" },
    { idx: 28, name: "temporal_entropy", cat: "Variability", unit: "nats", desc: "Shannon temporal entropy of event timing" }
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-dark)' }}>
      <Sidebar />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <TopNavbar title="Real-Time Behavior Monitor (Phase 4)" />

        <div style={{ padding: '28px 32px', flex: 1, display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Top Monitoring Control Panel */}
          <div className="glass-card" style={{ padding: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ width: 10, height: 10, borderRadius: '50%', background: isMonitoring ? 'var(--accent-emerald)' : 'var(--accent-rose)' }}></span>
                    <strong style={{ fontSize: '0.95rem', color: '#fff' }}>
                      CONTINUOUS MONITORING: {isMonitoring ? 'ACTIVE' : 'PAUSED'}
                    </strong>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(0,229,255,0.1)', padding: '4px 10px', borderRadius: 6, color: 'var(--accent-cyan)', fontSize: '0.78rem', fontWeight: 700 }}>
                    <EyeOff size={14} /> PRIVACY MODE: ACTIVE
                  </div>

                  {isIdle && (
                    <span className="status-badge monitor" style={{ fontSize: '0.7rem' }}>
                      USER IDLE (&gt;30s)
                    </span>
                  )}
                </div>

                <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                  🔒 <strong>Raw text is never stored.</strong> Keystroke characters and raw mouse coordinate streams are completely omitted. Aggregated 28D numeric vectors are processed locally in 10s windows.
                </p>
              </div>

              {/* Start/Stop Monitoring Controls */}
              <div style={{ display: 'flex', gap: 10 }}>
                {isMonitoring ? (
                  <button
                    onClick={handleToggleMonitoring}
                    style={{ padding: '10px 18px', borderRadius: 8, background: 'rgba(244,63,94,0.15)', border: '1px solid rgba(244,63,94,0.4)', color: 'var(--accent-rose)', fontWeight: 700, fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: 8 }}
                  >
                    <Square size={14} /> Stop Monitoring
                  </button>
                ) : (
                  <button
                    onClick={handleToggleMonitoring}
                    style={{ padding: '10px 18px', borderRadius: 8, background: 'var(--accent-emerald)', color: '#0a0d14', fontWeight: 700, fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: 8 }}
                  >
                    <Play size={14} /> Start Monitoring
                  </button>
                )}
              </div>
            </div>

            {/* Metrics Bar */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12, marginTop: 20, paddingTop: 16, borderTop: '1px solid var(--border-color)' }}>
              <div>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>ANALYSIS WINDOW</span>
                <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--accent-cyan)' }}>10 seconds</div>
              </div>
              <div>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>EVENTS PROCESSED</span>
                <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#fff' }}>{eventCount}</div>
              </div>
              <div>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>WINDOWS EVALUATED</span>
                <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--accent-purple)' }}>{windowCount}</div>
              </div>
              <div>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>SESSION DURATION</span>
                <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#fff' }}>{sessionDurationSec}s</div>
              </div>
              <div>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>LAST ANALYSIS</span>
                <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--accent-emerald)' }}>{lastAnalysisTime || 'Waiting...'}</div>
              </div>
            </div>
          </div>

          {/* Real-Time Evaluation Result - Phase 5 Hybrid ML Breakdown */}
          {latestResult ? (
            <div className="glass-card" style={{ padding: 24, borderLeft: `4px solid ${
              (latestResult.securityStatus || latestResult.status) === 'VERIFIED' ? 'var(--accent-emerald)' :
              (latestResult.securityStatus || latestResult.status) === 'MONITOR' ? 'var(--accent-cyan)' :
              (latestResult.securityStatus || latestResult.status) === 'SUSPICIOUS' ? '#f59e0b' : 'var(--accent-rose)'
            }` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <Shield size={20} color="var(--accent-cyan)" />
                    <h3 style={{ fontSize: '1.05rem', fontWeight: 800 }}>Last Prediction (Hybrid Anomaly Ensemble)</h3>
                  </div>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: 4 }}>
                    Model: {latestResult.modelVersion || '1.0.0-hybrid'} | Processing Time: {latestResult.processingTimeMs ? `${latestResult.processingTimeMs.toFixed(1)}ms` : '1.5ms'} | Feature Count: 28
                  </p>
                </div>
                <span className={`status-badge ${(latestResult.securityStatus || latestResult.status || 'VERIFIED').toLowerCase()}`}>
                  {latestResult.securityStatus || latestResult.status || 'VERIFIED'}
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginTop: 12 }}>
                {/* Isolation Forest Card */}
                <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)', borderRadius: 10, padding: 16 }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Isolation Forest</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
                    <span style={{
                      fontWeight: 800,
                      fontSize: '0.95rem',
                      color: (latestResult.models?.isolationForest?.status || (latestResult.isolationRisk > 50 ? 'ANOMALOUS' : 'NORMAL')) === 'ANOMALOUS' ? 'var(--accent-rose)' : 'var(--accent-emerald)'
                    }}>
                      {latestResult.models?.isolationForest?.status || (latestResult.isolationRisk > 50 ? 'ANOMALOUS' : 'NORMAL')}
                    </span>
                    <span style={{ fontSize: '0.85rem', fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--text-secondary)' }}>
                      Risk: {latestResult.isolationRisk ?? latestResult.models?.isolationForest?.riskScore ?? 0} / 100
                    </span>
                  </div>
                </div>

                {/* One-Class SVM Card */}
                <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)', borderRadius: 10, padding: 16 }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>One-Class SVM</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
                    <span style={{
                      fontWeight: 800,
                      fontSize: '0.95rem',
                      color: (latestResult.models?.oneClassSVM?.status || (latestResult.svmRisk > 50 ? 'ANOMALOUS' : 'NORMAL')) === 'ANOMALOUS' ? 'var(--accent-rose)' : 'var(--accent-emerald)'
                    }}>
                      {latestResult.models?.oneClassSVM?.status || (latestResult.svmRisk > 50 ? 'ANOMALOUS' : 'NORMAL')}
                    </span>
                    <span style={{ fontSize: '0.85rem', fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--text-secondary)' }}>
                      Risk: {latestResult.svmRisk ?? latestResult.models?.oneClassSVM?.riskScore ?? 0} / 100
                    </span>
                  </div>
                </div>

                {/* 0.5/0.5 Hybrid Ensemble Summary Card */}
                <div style={{ background: 'rgba(0, 229, 255, 0.04)', border: '1px solid rgba(0, 229, 255, 0.2)', borderRadius: 10, padding: 16 }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--accent-cyan)', fontWeight: 700, textTransform: 'uppercase' }}>0.5 / 0.5 Hybrid Ensemble</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
                    <div>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Risk: </span>
                      <strong style={{ fontSize: '1rem', color: '#fff', fontFamily: 'var(--font-mono)' }}>{latestResult.riskScore} / 100</strong>
                    </div>
                    <div>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Trust: </span>
                      <strong style={{ fontSize: '1rem', color: 'var(--accent-emerald)', fontFamily: 'var(--font-mono)' }}>{latestResult.trustScore} / 100</strong>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="glass-card" style={{ padding: 20, textAlign: 'center', color: 'var(--text-secondary)' }}>
              <p style={{ fontSize: '0.88rem' }}>⏳ Waiting for initial 10-second behavioral window aggregation...</p>
            </div>
          )}

          {/* 28-Dimensional Numerical Vector Table */}
          <div className="glass-card" style={{ padding: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>28-Dimensional Feature Vector Specification</h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: 2 }}>
                  Live aggregated values generated locally at the end of each 10-second window
                </p>
              </div>
              <span className="status-badge verified" style={{ fontSize: '0.68rem' }}>28 NUMERIC FEATURES</span>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.82rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    <th style={{ padding: '10px 12px' }}>#</th>
                    <th style={{ padding: '10px 12px' }}>Feature Identifier</th>
                    <th style={{ padding: '10px 12px' }}>Category</th>
                    <th style={{ padding: '10px 12px' }}>Description</th>
                    <th style={{ padding: '10px 12px' }}>Unit</th>
                    <th style={{ padding: '10px 12px', textAlign: 'right' }}>Current Window Value</th>
                  </tr>
                </thead>
                <tbody>
                  {featureDefinitions.map((feat, idx) => {
                    const val = latestFeatures ? latestFeatures[idx] : 0.0;
                    return (
                      <tr key={feat.idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                        <td style={{ padding: '10px 12px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>{feat.idx}</td>
                        <td style={{ padding: '10px 12px', fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--accent-cyan)' }}>{feat.name}</td>
                        <td style={{ padding: '10px 12px', color: 'var(--text-secondary)' }}>{feat.cat}</td>
                        <td style={{ padding: '10px 12px', color: 'var(--text-secondary)' }}>{feat.desc}</td>
                        <td style={{ padding: '10px 12px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{feat.unit}</td>
                        <td style={{ padding: '10px 12px', textAlign: 'right', fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#fff' }}>
                          {val}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
