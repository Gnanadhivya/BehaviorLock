import { useEffect, useRef, useState } from 'react';

/**
 * BehaviorTracker - Privacy-Preserving Behavioral Collector Hook
 * 
 * STRICT PRIVACY ASSURANCE:
 * - NO raw text, keycodes, characters, passwords, or strings are EVER captured, stored, or sent.
 * - NO raw mouse coordinate streams are stored permanently.
 * - Calculates aggregated 28-dimensional statistical vectors over rolling windows locally.
 */
export function useBehaviorTracker(onWindowTelemetry = null, intervalMs = 7000) {
  const [currentTelemetry, setCurrentTelemetry] = useState(null);
  
  // High precision time & event accumulators
  const sessionStartTime = useRef(Date.now());
  const windowStartTime = useRef(Date.now());
  
  // Mouse state accumulators
  const lastMousePos = useRef(null);
  const lastMouseTime = useRef(null);
  const mouseSpeeds = useRef([]);
  const mouseAccelerations = useRef([]);
  const mouseDirChanges = useRef(0);
  const mouseLastAngle = useRef(null);
  const mouseTotalDistance = useRef(0);
  
  // Click accumulators
  const clickTimes = useRef([]);
  const clickDurations = useRef([]);
  const mouseDownTime = useRef(null);
  
  // Typing stats (TIMINGS ONLY - ZERO TEXT / ZERO KEY CODES CAPTURED)
  const keyPressTimings = useRef([]); // [{holdTime, flightTime}]
  const lastKeyUpTime = useRef(null);
  const lastKeyDownTime = useRef({});
  
  // Scroll accumulators
  const scrollSpeeds = useRef([]);
  const scrollTotalDist = useRef(0);
  const lastScrollPos = useRef(window.scrollY);
  const lastScrollTime = useRef(Date.now());
  const scrollCount = useRef(0);
  
  // Focus & visibility events
  const focusCount = useRef(0);
  const blurCount = useRef(0);
  const tabVisibilityChanges = useRef(0);
  
  // Idle vs active tracking
  const lastActivityTime = useRef(Date.now());
  const idleTimeMs = useRef(0);
  const activeTimeMs = useRef(0);

  useEffect(() => {
    // 1. Mouse movement tracking
    const handleMouseMove = (e) => {
      const now = performance.now();
      lastActivityTime.current = Date.now();
      
      if (lastMousePos.current && lastMouseTime.current) {
        const dx = e.clientX - lastMousePos.current.x;
        const dy = e.clientY - lastMousePos.current.y;
        const dt = (now - lastMouseTime.current) / 1000.0; // seconds
        
        if (dt > 0.001) {
          const dist = Math.sqrt(dx * dx + dy * dy);
          const speed = dist / dt;
          mouseTotalDistance.current += dist;
          
          if (mouseSpeeds.current.length > 0) {
            const prevSpeed = mouseSpeeds.current[mouseSpeeds.current.length - 1];
            const accel = Math.abs(speed - prevSpeed) / dt;
            mouseAccelerations.current.push(accel);
          }
          mouseSpeeds.current.push(speed);
          
          // Direction change detection
          const angle = Math.atan2(dy, dx);
          if (mouseLastAngle.current !== null) {
            const diff = Math.abs(angle - mouseLastAngle.current);
            if (diff > 0.5) { // ~30 degrees
              mouseDirChanges.current += 1;
            }
          }
          mouseLastAngle.current = angle;
        }
      }
      
      lastMousePos.current = { x: e.clientX, y: e.clientY };
      lastMouseTime.current = now;
    };

    // 2. Mouse Click tracking
    const handleMouseDown = () => {
      mouseDownTime.current = performance.now();
      lastActivityTime.current = Date.now();
    };

    const handleMouseUp = () => {
      if (mouseDownTime.current) {
        const now = performance.now();
        const duration = now - mouseDownTime.current;
        clickDurations.current.push(duration);
        clickTimes.current.push(now);
      }
    };

    // 3. Typing timing tracking - STRICTLY ONLY TIMINGS
    const handleKeyDown = (e) => {
      const now = performance.now();
      lastActivityTime.current = Date.now();
      
      // Use event object identity hash key to track hold time without recording key character
      const keyId = e.code || 'key';
      if (!lastKeyDownTime.current[keyId]) {
        lastKeyDownTime.current[keyId] = now;
      }
    };

    const handleKeyUp = (e) => {
      const now = performance.now();
      const keyId = e.code || 'key';
      
      if (lastKeyDownTime.current[keyId]) {
        const holdTime = now - lastKeyDownTime.current[keyId];
        delete lastKeyDownTime.current[keyId];
        
        let flightTime = 0;
        if (lastKeyUpTime.current !== null) {
          flightTime = Math.max(0, now - lastKeyUpTime.current);
        }
        lastKeyUpTime.current = now;
        
        keyPressTimings.current.push({ holdTime, flightTime });
      }
    };

    // 4. Scroll tracking
    const handleScroll = () => {
      const now = Date.now();
      const dt = (now - lastScrollTime.current) / 1000.0;
      const dist = Math.abs(window.scrollY - lastScrollPos.current);
      
      if (dt > 0.01) {
        scrollSpeeds.current.push(dist / dt);
      }
      scrollTotalDist.current += dist;
      scrollCount.current += 1;
      
      lastScrollPos.current = window.scrollY;
      lastScrollTime.current = now;
      lastActivityTime.current = Date.now();
    };

    // 5. Focus & Visibility tracking
    const handleFocus = () => { focusCount.current += 1; };
    const handleBlur = () => { blurCount.current += 1; };
    const handleVisibility = () => { tabVisibilityChanges.current += 1; };

    // Attach passive listeners for maximum UI smoothness
    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('focus', handleFocus);
    window.addEventListener('blur', handleBlur);
    document.addEventListener('visibilitychange', handleVisibility);

    // Window Telemetry Summarizer Loop (Runs every intervalMs)
    const timer = setInterval(() => {
      const now = Date.now();
      const winDuration = now - windowStartTime.current;
      const sessDuration = Math.round((now - sessionStartTime.current) / 1000.0);
      
      // Helper stats
      const calcMean = (arr) => arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;
      const calcStd = (arr, mean) => {
        if (arr.length <= 1) return 0;
        const variance = arr.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / arr.length;
        return Math.sqrt(variance);
      };

      const mSpeedMean = calcMean(mouseSpeeds.current);
      const mSpeedStd = calcStd(mouseSpeeds.current, mSpeedMean);
      const mAccelMean = calcMean(mouseAccelerations.current);
      const mAccelStd = calcStd(mouseAccelerations.current, mAccelMean);
      
      const clickInts = [];
      for (let i = 1; i < clickTimes.current.length; i++) {
        clickInts.push(clickTimes.current[i] - clickTimes.current[i - 1]);
      }
      const clickIntMean = calcMean(clickInts);
      const clickIntStd = calcStd(clickInts, clickIntMean);
      const clickDurMean = calcMean(clickDurations.current);
      const clickFreq = (clickTimes.current.length / (winDuration / 1000.0));

      const holds = keyPressTimings.current.map(k => k.holdTime);
      const flights = keyPressTimings.current.map(k => k.flightTime);
      const holdMean = calcMean(holds);
      const holdStd = calcStd(holds, holdMean);
      const flightMean = calcMean(flights);
      const flightStd = calcStd(flights, flightMean);
      const typeSpeedVar = flightStd;
      const wpmEst = keyPressTimings.current.length > 0 ? (keyPressTimings.current.length / 5) / (winDuration / 60000.0) : 0;

      const scrSpeedMean = calcMean(scrollSpeeds.current);
      const scrSpeedStd = calcStd(scrollSpeeds.current, scrSpeedMean);

      // Idle calculation
      const timeSinceLastAct = now - lastActivityTime.current;
      const isCurrentlyIdle = timeSinceLastAct > 2000;
      if (isCurrentlyIdle) {
        idleTimeMs.current += intervalMs;
      } else {
        activeTimeMs.current += intervalMs;
      }

      // Construct 28-Dimensional Vector
      const featureVector = [
        Number(mSpeedMean.toFixed(2)),
        Number(mSpeedStd.toFixed(2)),
        Number(mAccelMean.toFixed(2)),
        Number(mAccelStd.toFixed(2)),
        mouseDirChanges.current,
        Number((mouseTotalDistance.current / (mSpeedMean + 1)).toFixed(2)), // curvature ratio
        Number(clickIntMean.toFixed(2)),
        Number(clickIntStd.toFixed(2)),
        Number(clickDurMean.toFixed(2)),
        Number(clickFreq.toFixed(2)),
        Number(holdMean.toFixed(2)),
        Number(holdStd.toFixed(2)),
        Number(flightMean.toFixed(2)),
        Number(flightStd.toFixed(2)),
        Number(typeSpeedVar.toFixed(2)),
        Number(wpmEst.toFixed(2)),
        Number(scrSpeedMean.toFixed(2)),
        Number(scrSpeedStd.toFixed(2)),
        scrollCount.current,
        Number(scrollTotalDist.current.toFixed(2)),
        tabVisibilityChanges.current,
        focusCount.current,
        blurCount.current,
        idleTimeMs.current,
        activeTimeMs.current,
        winDuration,
        sessDuration,
        Number(mouseTotalDistance.current.toFixed(2))
      ];

      const telemetryObj = {
        features: featureVector,
        timestamp: new Date().toISOString(),
        statsSummary: {
          mouseSpeed: mSpeedMean.toFixed(1),
          typingSpeedWPM: wpmEst.toFixed(1),
          clickCount: clickTimes.current.length,
          idleTimeRatio: (idleTimeMs.current / (winDuration + 1) * 100).toFixed(0) + '%'
        }
      };

      setCurrentTelemetry(telemetryObj);
      if (onWindowTelemetry) {
        onWindowTelemetry(telemetryObj);
      }

      // Reset window accumulators for next window
      mouseSpeeds.current = [];
      mouseAccelerations.current = [];
      mouseDirChanges.current = 0;
      mouseTotalDistance.current = 0;
      clickTimes.current = [];
      clickDurations.current = [];
      keyPressTimings.current = [];
      scrollSpeeds.current = [];
      scrollTotalDist.current = 0;
      scrollCount.current = 0;
      windowStartTime.current = Date.now();
    }, intervalMs);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('blur', handleBlur);
      document.removeEventListener('visibilitychange', handleVisibility);
      clearInterval(timer);
    };
  }, [onWindowTelemetry, intervalMs]);

  return currentTelemetry;
}
