/**
 * BehaviorLock Telemetry Worker (Off-Thread Processing Engine)
 * Privacy Policy: Zero-Text Privacy. No typed letters or credentials recorded.
 * Computes: Dwell Time (DT), Flight Time (FT), Velocity (V), Curvature Index (C).
 */

let keyBuffer = [];
let mouseMovements = [];
let clickEvents = [];
let scrollEvents = [];
let lastKeyReleaseTime = null;
let activeKeyDowns = {};

self.onmessage = function(e) {
  const { type, payload } = e.data;

  if (type === 'RAW_EVENT') {
    processRawEvent(payload);
  } else if (type === 'FLUSH_BATCH') {
    flushTelemetryBatch();
  } else if (type === 'RESET') {
    resetBuffer();
  }
};

function processRawEvent(event) {
  const { eventType, timestamp, x, y, deltaY } = event;

  if (eventType === 'keydown') {
    // Key press timestamp
    if (!activeKeyDowns['current']) {
      activeKeyDowns['current'] = timestamp;

      // Flight time (time between releasing previous key and pressing current key)
      if (lastKeyReleaseTime !== null) {
        const flightTime = timestamp - lastKeyReleaseTime;
        if (flightTime >= 0 && flightTime < 5000) {
          keyBuffer.push({ type: 'FT', value: flightTime });
        }
      }
    }
  } else if (eventType === 'keyup') {
    if (activeKeyDowns['current']) {
      const pressTime = activeKeyDowns['current'];
      const dwellTime = timestamp - pressTime;
      delete activeKeyDowns['current'];
      lastKeyReleaseTime = timestamp;

      if (dwellTime >= 0 && dwellTime < 3000) {
        keyBuffer.push({ type: 'DT', value: dwellTime });
      }
    }
  } else if (eventType === 'mousemove') {
    mouseMovements.push({ x, y, t: timestamp });
    // Keep max 200 recent cursor points to avoid memory bloat
    if (mouseMovements.length > 200) mouseMovements.shift();
  } else if (eventType === 'mousedown') {
    clickEvents.push({ type: 'down', t: timestamp });
  } else if (eventType === 'mouseup') {
    const lastDown = clickEvents.filter(c => c.type === 'down').pop();
    if (lastDown) {
      const holdDuration = timestamp - lastDown.t;
      clickEvents.push({ type: 'hold', value: holdDuration });
    }
  } else if (eventType === 'wheel') {
    scrollEvents.push({ t: timestamp, deltaY });
  }
}

function calculateMean(arr) {
  if (!arr || arr.length === 0) return 0;
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}

function calculateStd(arr, mean) {
  if (!arr || arr.length <= 1) return 0;
  const variance = arr.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / (arr.length - 1);
  return Math.sqrt(variance);
}

function flushTelemetryBatch() {
  const dwellTimes = keyBuffer.filter(k => k.type === 'DT').map(k => k.value);
  const flightTimes = keyBuffer.filter(k => k.type === 'FT').map(k => k.value);
  const holdTimes = clickEvents.filter(c => c.type === 'hold').map(c => c.value);

  // Compute Mouse Velocity & Trajectory Curvature Index (C)
  let totalArcDistance = 0;
  let totalTimeMs = 0;
  let velocities = [];

  for (let i = 1; i < mouseMovements.length; i++) {
    const p1 = mouseMovements[i - 1];
    const p2 = mouseMovements[i];
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    const dt = p2.t - p1.t;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dt > 0) {
      velocities.push(dist / dt); // pixels per ms
      totalArcDistance += dist;
      totalTimeMs += dt;
    }
  }

  // Straight line distance (start to end)
  let straightDistance = 0;
  if (mouseMovements.length >= 2) {
    const first = mouseMovements[0];
    const last = mouseMovements[mouseMovements.length - 1];
    straightDistance = Math.sqrt(Math.pow(last.x - first.x, 2) + Math.pow(last.y - first.y, 2));
  }

  // Curvature Index C = straight / arc (1.0 = straight line, < 0.8 = arc/human curvature)
  let curvatureIndex = 0.90;
  if (totalArcDistance > 5) {
    curvatureIndex = Math.min(1.0, straightDistance / totalArcDistance);
  }

  const dwellMean = calculateMean(dwellTimes) || 120.0;
  const dwellStd = calculateStd(dwellTimes, dwellMean) || 15.0;
  const flightMean = calculateMean(flightTimes) || 90.0;
  const velocityMean = calculateMean(velocities) || 1.2;
  const holdMean = calculateMean(holdTimes) || 110.0;
  const scrollFreq = scrollEvents.length;

  // Standard 7-dimensional Behavioral Feature Vector
  const featureVector = [
    parseFloat(dwellMean.toFixed(2)),
    parseFloat(dwellStd.toFixed(2)),
    parseFloat(flightMean.toFixed(2)),
    parseFloat(velocityMean.toFixed(3)),
    parseFloat(curvatureIndex.toFixed(3)),
    parseFloat(holdMean.toFixed(2)),
    parseFloat(scrollFreq.toFixed(1))
  ];

  self.postMessage({
    type: 'TELEMETRY_BATCH',
    featureVector,
    metrics: {
      dwellCount: dwellTimes.length,
      flightCount: flightTimes.length,
      dwellMean: dwellMean.toFixed(1),
      flightMean: flightMean.toFixed(1),
      velocityMean: (velocityMean * 1000).toFixed(0), // px/sec
      curvatureIndex: curvatureIndex.toFixed(2),
      holdMean: holdMean.toFixed(1),
      mousePointsCount: mouseMovements.length
    }
  });

  // Reset buffers for next batch
  keyBuffer = [];
  clickEvents = [];
  scrollEvents = [];
  mouseMovements = mouseMovements.slice(-10); // Keep last 10 points for continuity
}

function resetBuffer() {
  keyBuffer = [];
  mouseMovements = [];
  clickEvents = [];
  scrollEvents = [];
  lastKeyReleaseTime = null;
  activeKeyDowns = {};
}
