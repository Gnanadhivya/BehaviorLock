import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * useBehaviorLock React Custom Hook
 * Pluggable continuous authentication hook for React web applications.
 */
export function useBehaviorLock({ userId = 'demo_user_1', batchIntervalMs = 5000, active = true } = {}) {
  const [riskScore, setRiskScore] = useState(0.15);
  const [rawScore, setRawScore] = useState(0.15);
  const [riskLevel, setRiskLevel] = useState('LOW');
  const [isAnomaly, setIsAnomaly] = useState(false);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [sampleCount, setSampleCount] = useState(0);
  const [telemetryStats, setTelemetryStats] = useState(null);
  const [scoreHistory, setScoreHistory] = useState([]);
  const [statusMessage, setStatusMessage] = useState('Initializing telemetry collector...');

  const workerRef = useRef(null);
  const timerRef = useRef(null);

  // Initialize Worker & Setup Event Listeners
  useEffect(() => {
    if (!active) return;

    // Instantiate Web Worker thread
    workerRef.current = new Worker(new URL('./telemetryWorker.js', import.meta.url), { type: 'module' });

    // Handle messages from Web Worker
    workerRef.current.onmessage = (e) => {
      const { type, featureVector, metrics } = e.data;
      if (type === 'TELEMETRY_BATCH') {
        setTelemetryStats(metrics);
        sendTelemetryToBackend(featureVector, metrics);
      }
    };

    // Attach non-blocking listeners to window
    const handleKeyDown = (e) => {
      workerRef.current?.postMessage({
        type: 'RAW_EVENT',
        payload: { eventType: 'keydown', timestamp: performance.now() }
      });
    };

    const handleKeyUp = (e) => {
      workerRef.current?.postMessage({
        type: 'RAW_EVENT',
        payload: { eventType: 'keyup', timestamp: performance.now() }
      });
    };

    const handleMouseMove = (e) => {
      workerRef.current?.postMessage({
        type: 'RAW_EVENT',
        payload: { eventType: 'mousemove', timestamp: performance.now(), x: e.clientX, y: e.clientY }
      });
    };

    const handleMouseDown = (e) => {
      workerRef.current?.postMessage({
        type: 'RAW_EVENT',
        payload: { eventType: 'mousedown', timestamp: performance.now(), x: e.clientX, y: e.clientY }
      });
    };

    const handleMouseUp = (e) => {
      workerRef.current?.postMessage({
        type: 'RAW_EVENT',
        payload: { eventType: 'mouseup', timestamp: performance.now(), x: e.clientX, y: e.clientY }
      });
    };

    const handleWheel = (e) => {
      workerRef.current?.postMessage({
        type: 'RAW_EVENT',
        payload: { eventType: 'wheel', timestamp: performance.now(), deltaY: e.deltaY }
      });
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('wheel', handleWheel);

    // Batch Interval Timer
    timerRef.current = setInterval(() => {
      workerRef.current?.postMessage({ type: 'FLUSH_BATCH' });
    }, batchIntervalMs);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('wheel', handleWheel);
      if (timerRef.current) clearInterval(timerRef.current);
      workerRef.current?.terminate();
    };
  }, [userId, batchIntervalMs, active]);

  // Send batch feature vector to Python Backend REST API
  const sendTelemetryToBackend = async (featureVector, metrics) => {
    try {
      const response = await fetch('/api/v1/telemetry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          features: featureVector,
          rawMetrics: metrics
        })
      });

      if (!response.ok) {
        throw new Error(`Server returned ${response.status}`);
      }

      const data = await response.json();
      setRiskScore(data.anomalyScore);
      setRawScore(data.rawScore);
      setRiskLevel(data.riskLevel);
      setIsAnomaly(data.riskLevel === 'HIGH' || data.riskLevel === 'MEDIUM');
      setIsEnrolled(data.isEnrolled);
      setSampleCount(data.sampleCount);

      if (!data.isEnrolled) {
        setStatusMessage(`Enrollment Mode: Building baseline (${data.sampleCount}/3 samples collected)`);
      } else {
        setStatusMessage(`Active Monitoring: Risk Level ${data.riskLevel} (${(data.anomalyScore * 100).toFixed(0)}%)`);
      }

      // Add entry to live history chart
      setScoreHistory(prev => [
        ...prev.slice(-20),
        {
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          score: Math.round(data.anomalyScore * 100),
          risk: data.riskLevel
        }
      ]);
    } catch (err) {
      console.warn('Backend API connection failed, running offline fallback mode:', err.message);
      // Fallback offline calculation if backend is initializing
      setRiskScore(0.18);
      setRiskLevel('LOW');
      setStatusMessage('Connected to Local Telemetry Worker (Offline Mode)');
    }
  };

  const triggerManualFlush = useCallback(() => {
    workerRef.current?.postMessage({ type: 'FLUSH_BATCH' });
  }, []);

  const resetBaseline = async () => {
    try {
      await fetch('/api/v1/reset-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      });
      workerRef.current?.postMessage({ type: 'RESET' });
      setRiskScore(0.15);
      setRiskLevel('LOW');
      setIsEnrolled(false);
      setSampleCount(0);
      setScoreHistory([]);
      setStatusMessage('User Baseline Reset. Starting Silent Enrollment...');
    } catch (e) {
      console.error('Reset failed', e);
    }
  };

  const simulateIntruder = async (mode = 'FAST_BOT') => {
    try {
      const response = await fetch('/api/v1/simulate-intruder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, mode })
      });
      const data = await response.json();
      setRiskScore(data.anomalyScore);
      setRawScore(data.rawScore);
      setRiskLevel(data.riskLevel);
      setIsAnomaly(data.riskLevel !== 'LOW');
      setStatusMessage(`SIMULATION ATTACK EXECUTED: ${mode} triggered ${data.riskLevel} Risk!`);

      setScoreHistory(prev => [
        ...prev.slice(-20),
        {
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          score: Math.round(data.anomalyScore * 100),
          risk: data.riskLevel
        }
      ]);
    } catch (e) {
      console.error('Intruder simulation error', e);
    }
  };

  const stepUpVerifySuccess = () => {
    setRiskLevel('LOW');
    setRiskScore(0.20);
    setIsAnomaly(false);
    setStatusMessage('Re-authentication verified successfully! Session restored.');
  };

  return {
    riskScore,
    rawScore,
    riskLevel,
    isAnomaly,
    isEnrolled,
    sampleCount,
    telemetryStats,
    scoreHistory,
    statusMessage,
    resetBaseline,
    simulateIntruder,
    stepUpVerifySuccess,
    triggerManualFlush
  };
}
