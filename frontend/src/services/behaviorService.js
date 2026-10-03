import api from './api';

let isMonitoringActive = false;
let currentSessionId = `sess_${Date.now()}`;

export const startMonitoring = () => {
  isMonitoringActive = true;
  if (!currentSessionId) {
    currentSessionId = `sess_${Date.now()}`;
  }
  return {
    status: 'ACTIVE',
    sessionId: currentSessionId,
    startTime: new Date().toISOString()
  };
};

export const stopMonitoring = () => {
  isMonitoringActive = false;
  return {
    status: 'PAUSED',
    sessionId: currentSessionId,
    stopTime: new Date().toISOString()
  };
};

export const getCurrentBehaviorStatus = () => {
  return {
    isMonitoringActive,
    sessionId: currentSessionId,
    privacyMode: 'ACTIVE',
    rawTextStored: false
  };
};

export const sendBehaviorWindow = async (features, windowDuration = 10) => {
  if (!features || features.length !== 28) {
    throw new Error("Invalid feature vector: must contain exactly 28 numeric values.");
  }

  const payload = {
    sessionId: currentSessionId || `sess_${Date.now()}`,
    timestamp: new Date().toISOString(),
    windowDuration: windowDuration,
    features: features
  };

  const response = await api.post('/api/behavior/window', payload);
  return response.data;
};

export default {
  startMonitoring,
  stopMonitoring,
  getCurrentBehaviorStatus,
  sendBehaviorWindow
};
