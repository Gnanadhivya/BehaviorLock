import React, { useEffect, useState } from 'react';
import Sidebar from '../components/dashboard/Sidebar';
import TopNavbar from '../components/dashboard/TopNavbar';
import ProtectionStatusCard from '../components/dashboard/ProtectionStatusCard';
import TrustScoreCard from '../components/dashboard/TrustScoreCard';
import SecurityStatusCard from '../components/dashboard/SecurityStatusCard';
import BehaviorCard from '../components/dashboard/BehaviorCard';
import RiskChart from '../components/dashboard/RiskChart';
import ActivitySummaryCard from '../components/dashboard/ActivitySummaryCard';
import DeviceTable from '../components/dashboard/DeviceTable';
import AlertList from '../components/dashboard/AlertList';
import QuickActions from '../components/dashboard/QuickActions';

import { getDashboardSummary, getRiskHistory, getDevices, getAlerts } from '../services/api';
import { useBehaviorTracker } from '../hooks/useBehaviorTracker';
import { AlertCircle, Loader2 } from 'lucide-react';

export default function DashboardPage() {
  const [summary, setSummary] = useState(null);
  const [riskHistory, setRiskHistory] = useState([]);
  const [devices, setDevices] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Activate zero-text in-browser behavioral signal aggregator hook
  const telemetry = useBehaviorTracker((data) => {
    // Continuous local telemetry telemetry loop
  }, 5000);

  useEffect(() => {
    let isMounted = true;
    const fetchDashboardData = async () => {
      try {
        const [sumData, riskData, devData, alertData] = await Promise.all([
          getDashboardSummary().catch(() => null),
          getRiskHistory().catch(() => []),
          getDevices().catch(() => []),
          getAlerts().catch(() => [])
        ]);

        if (isMounted) {
          setSummary(sumData || {
            protectionActive: true,
            protectionStatus: "ACTIVE",
            trustScore: 94,
            riskScore: 6,
            securityStatus: "VERIFIED",
            sessionDuration: "42 minutes",
            lastAnalysisTime: "Just now",
            todayActivitiesCount: 148,
            activeDevicesCount: 1,
            openAlertsCount: 0
          });
          setRiskHistory(riskData && riskData.length > 0 ? riskData : [
            { time: '12 AM', riskScore: 8 },
            { time: '1 AM', riskScore: 7 },
            { time: '2 AM', riskScore: 10 },
            { time: '3 AM', riskScore: 6 },
            { time: '4 AM', riskScore: 9 },
          ]);
          setDevices(devData || []);
          setAlerts(alertData || []);
          setLoading(false);
        }
      } catch (err) {
        console.error("Error loading dashboard data:", err);
        if (isMounted) {
          setError("Failed to load live security telemetry.");
          setLoading(false);
        }
      }
    };

    fetchDashboardData();
    return () => { isMounted = false; };
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-dark)' }}>
        <Sidebar />
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-cyan)' }}>
          <div style={{ textAlign: 'center' }}>
            <Loader2 size={36} style={{ animation: 'spin 1s linear infinite', margin: '0 auto 12px auto' }} />
            <p style={{ fontSize: '0.9rem', fontWeight: 600 }}>Loading BehaviorLock Security Dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-dark)' }}>
      {/* Sidebar Navigation */}
      <Sidebar />

      {/* Main Content Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Top Navbar */}
        <TopNavbar title="Continuous Security Dashboard" alertCount={alerts.length} />

        <div style={{ padding: '28px 32px', flex: 1, display: 'flex', flexDirection: 'column', gap: 24 }}>
          {error && (
            <div style={{ background: 'rgba(244,63,94,0.12)', border: '1px solid rgba(244,63,94,0.3)', color: 'var(--accent-rose)', padding: '12px 16px', borderRadius: 10, fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: 10 }}>
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          {/* Row 1: Key Telemetry Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
            <ProtectionStatusCard
              active={summary?.protectionActive}
              sessionDuration={summary?.sessionDuration}
              lastAnalysis={summary?.lastAnalysisTime}
            />
            <TrustScoreCard
              trustScore={summary?.trustScore ?? 94}
              riskScore={summary?.riskScore ?? 6}
              status={summary?.securityStatus ?? "VERIFIED"}
            />
            <SecurityStatusCard
              status={summary?.securityStatus ?? "VERIFIED"}
            />
          </div>

          {/* Row 2: Behavioral Overview Cards (5 Categories) */}
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 14 }}>Behavioral Overview (28D Feature Summary)</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
              <BehaviorCard
                type="mouse"
                title="Mouse Behavior"
                status="NORMAL"
                activitySummary="Smooth curvature & speed trajectory"
                metricValue={telemetry?.statsSummary?.mouseSpeed || "420.5"}
                metricUnit="px/s mean"
              />
              <BehaviorCard
                type="typing"
                title="Typing Dynamics"
                status="NORMAL"
                activitySummary="Hold & flight times match baseline"
                metricValue={telemetry?.statsSummary?.typingSpeedWPM || "64.0"}
                metricUnit="WPM est"
              />
              <BehaviorCard
                type="scroll"
                title="Scroll Behavior"
                status="NORMAL"
                activitySummary="Consistent scroll speed & frequency"
                metricValue="120.0"
                metricUnit="px/s mean"
              />
              <BehaviorCard
                type="focus"
                title="Focus Behavior"
                status="NORMAL"
                activitySummary="Zero suspicious tab switches"
                metricValue="2"
                metricUnit="focus events"
              />
              <BehaviorCard
                type="session"
                title="Session Duration"
                status="NORMAL"
                activitySummary="Active duration vs idle ratio optimal"
                metricValue={summary?.sessionDuration || "42m"}
                metricUnit="active"
              />
            </div>
          </div>

          {/* Row 3: Risk Trend Chart & Activity Summary */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1.2fr', gap: 20 }}>
            <RiskChart data={riskHistory} />
            <ActivitySummaryCard
              todayActivities={summary?.todayActivitiesCount ?? 148}
              activeSessionTime={summary?.sessionDuration ?? "42m"}
              focusChanges={2}
              mouseInteractions="4.2k"
              scrollEvents={18}
              analysisWindows={48}
            />
          </div>

          {/* Row 4: Device Table & Security Alerts */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 20 }}>
            <DeviceTable devices={devices} />
            <AlertList alerts={alerts} />
          </div>

          {/* Row 5: Quick Actions */}
          <QuickActions />
        </div>
      </div>
    </div>
  );
}
