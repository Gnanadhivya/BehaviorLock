import { useEffect, useRef, useState, useCallback } from 'react';
import { sendBehaviorWindow } from '../services/behaviorService';

/**
 * useBehaviorCollector - 28-Dimensional Privacy-Preserving Behavioral Collector Engine
 * 
 * STRICT PRIVACY ASSURANCE:
 * - ZERO text, characters, key codes, passwords, or strings captured or transmitted.
 * - ZERO raw keyboard events stored in localStorage / sessionStorage.
 * - Raw event buffers exist strictly in temporary RAM during the 10s window and are cleared upon aggregation.
 * - 30-second idle detection logic.
 */
export function useBehaviorCollector(windowDurationSec = 10, isMonitoringActive = true) {
  const [isIdle, setIsIdle] = useState(false);
  const [windowCount, setWindowCount] = useState(0);
  const [eventCount, setEventCount] = useState(0);
  const [lastAnalysisTime, setLastAnalysisTime] = useState(null);
  const [latestResult, setLatestResult] = useState(null);
  const [latestFeatures, setLatestFeatures] = useState(null);
  const [sessionDurationSec, setSessionDurationSec] = useState(0);

  // Time references
  const sessionStartTime = useRef(Date.now());
  const lastActivityTime = useRef(Date.now());
  const windowStartTime = useRef(Date.now());

  // Accumulators for current 10-second window
  const mouseDistances = useRef([]);
  const mouseSpeeds = useRef([]);
  const mouseDirChanges = useRef(0);
  const mouseEventCount = useRef(0);
  const lastMousePos = useRef(null);
  const lastMouseTime = useRef(null);
  const lastMouseAngle = useRef(null);

  const clickTimes = useRef([]);
  const clickTypes = useRef({ left: 0, right: 0 });
  const doubleClicks = useRef(0);
  const lastClickTime = useRef(null);

  // TYPING - STRICTLY TIMINGS ONLY (NO CHARACTERS)
  const keyPressTimings = useRef([]); // [{holdTime, flightTime}]
  const keyUpTime = useRef(null);
  const keyDownMap = useRef({});

  const scrollDistances = useRef([]);
  const scrollSpeeds = useRef([]);
  const scrollCount = useRef(0);
  const lastScrollPos = useRef(typeof window !== 'undefined' ? window.scrollY : 0);
  const lastScrollTime = useRef(Date.now());

  const focusCount = useRef(0);
  const blurCount = useRef(0);
  const visibilityChanges = useRef(0);

  const idleTimeMs = useRef(0);
  const activeTimeMs = useRef(0);

  // Idle Detection Check (30 seconds threshold)
  useEffect(() => {
    const idleTimer = setInterval(() => {
      const now = Date.now();
      const inactiveMs = now - lastActivityTime.current;
      if (inactiveMs >= 30000) {
        setIsIdle(true);
      } else {
        setIsIdle(false);
      }
      setSessionDurationSec(Math.round((now - sessionStartTime.current) / 1000));
    }, 1000);

    return () => clearInterval(idleTimer);
  }, []);

  const registerActivity = useCallback(() => {
    lastActivityTime.current = Date.now();
    setIsIdle(false);
  }, []);

  useEffect(() => {
    if (!isMonitoringActive) return;

    // Mouse Move Handler
    const handleMouseMove = (e) => {
      registerActivity();
      mouseEventCount.current += 1;
      setEventCount(prev => prev + 1);

      const now = performance.now();
      if (lastMousePos.current && lastMouseTime.current) {
        const dx = e.clientX - lastMousePos.current.x;
        const dy = e.clientY - lastMousePos.current.y;
        const dt = (now - lastMouseTime.current) / 1000.0;

        if (dt > 0.001) {
          const dist = Math.sqrt(dx * dx + dy * dy);
          const speed = dist / dt;
          mouseDistances.current.push(dist);
          mouseSpeeds.current.push(speed);

          const angle = Math.atan2(dy, dx);
          if (lastMouseAngle.current !== null) {
            if (Math.abs(angle - lastMouseAngle.current) > 0.5) {
              mouseDirChanges.current += 1;
            }
          }
          lastMouseAngle.current = angle;
        }
      }
      lastMousePos.current = { x: e.clientX, y: e.clientY };
      lastMouseTime.current = now;
    };

    // Mouse Click Handler
    const handleMouseDown = (e) => {
      registerActivity();
      setEventCount(prev => prev + 1);
      const now = performance.now();

      if (e.button === 0) clickTypes.current.left += 1;
      else clickTypes.current.right += 1;

      if (lastClickTime.current && (now - lastClickTime.current) < 300) {
        doubleClicks.current += 1;
      }
      clickTimes.current.push(now);
      lastClickTime.current = now;
    };

    // Keyboard Handlers - ZERO KEY CHARACTERS CAPTURED
    const handleKeyDown = (e) => {
      registerActivity();
      setEventCount(prev => prev + 1);
      const now = performance.now();
      // Store dummy numeric hash identifier per active key press
      const dummyId = String(e.timeStamp);
      if (!keyDownMap.current[dummyId]) {
        keyDownMap.current[dummyId] = now;
      }
    };

    const handleKeyUp = () => {
      const now = performance.now();
      const keys = Object.keys(keyDownMap.current);
      if (keys.length > 0) {
        const firstKey = keys[0];
        const holdTime = now - keyDownMap.current[firstKey];
        delete keyDownMap.current[firstKey];

        let flightTime = 0;
        if (keyUpTime.current !== null) {
          flightTime = Math.max(0, now - keyUpTime.current);
        }
        keyUpTime.current = now;

        keyPressTimings.current.push({ holdTime, flightTime });
      }
    };

    // Scroll Handler
    const handleScroll = () => {
      registerActivity();
      setEventCount(prev => prev + 1);
      const now = Date.now();
      const dt = (now - lastScrollTime.current) / 1000.0;
      const dist = Math.abs(window.scrollY - lastScrollPos.current);

      if (dt > 0.01) {
        scrollSpeeds.current.push(dist / dt);
      }
      scrollDistances.current.push(dist);
      scrollCount.current += 1;

      lastScrollPos.current = window.scrollY;
      lastScrollTime.current = now;
    };

    const handleFocus = () => { focusCount.current += 1; };
    const handleBlur = () => { blurCount.current += 1; };
    const handleVisibility = () => { visibilityChanges.current += 1; };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('focus', handleFocus);
    window.addEventListener('blur', handleBlur);
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('blur', handleBlur);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [isMonitoringActive, registerActivity]);

  // 10-Second Window Aggregation Loop
  useEffect(() => {
    if (!isMonitoringActive) return;

    const intervalMs = windowDurationSec * 1000;
    const windowTimer = setInterval(async () => {
      const now = Date.now();
      const winDurSec = (now - windowStartTime.current) / 1000.0;

      // Statistical Helpers
      const calcMean = (arr) => arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;
      const calcVar = (arr, mean) => arr.length > 1 ? arr.reduce((s, v) => s + Math.pow(v - mean, 2), 0) / arr.length : 0;

      // 1. Mouse Features (1-5)
      const f1_mouse_event_count = mouseEventCount.current;
      const f2_mouse_distance_mean = Number(calcMean(mouseDistances.current).toFixed(2));
      const f3_mouse_speed_mean = Number(calcMean(mouseSpeeds.current).toFixed(2));
      const f4_mouse_speed_variance = Number(calcVar(mouseSpeeds.current, f3_mouse_speed_mean).toFixed(2));
      const f5_mouse_direction_change_rate = Number((mouseDirChanges.current / (winDurSec || 1)).toFixed(2));

      // 2. Click Features (6-9)
      const f6_click_count = clickTimes.current.length;
      const clickIntervals = [];
      for (let i = 1; i < clickTimes.current.length; i++) {
        clickIntervals.push((clickTimes.current[i] - clickTimes.current[i - 1]) / 1000.0);
      }
      const f7_click_interval_mean = Number(calcMean(clickIntervals).toFixed(2));
      const f8_click_interval_variance = Number(calcVar(clickIntervals, f7_click_interval_mean).toFixed(2));
      const f9_double_click_rate = Number((doubleClicks.current / (f6_click_count || 1)).toFixed(2));

      // 3. Typing Features (10-15) - TIMINGS ONLY
      const holds = keyPressTimings.current.map(k => k.holdTime);
      const flights = keyPressTimings.current.map(k => k.flightTime);
      const f10_key_hold_mean = Number(calcMean(holds).toFixed(2));
      const f11_key_hold_variance = Number(calcVar(holds, f10_key_hold_mean).toFixed(2));
      const f12_key_flight_mean = Number(calcMean(flights).toFixed(2));
      const f13_key_flight_variance = Number(calcVar(flights, f12_key_flight_mean).toFixed(2));
      const f14_typing_speed = keyPressTimings.current.length > 0 ? Number(((keyPressTimings.current.length / 5) / (winDurSec / 60.0)).toFixed(2)) : 0;
      const f15_typing_speed_variance = f13_key_flight_variance;

      // 4. Scroll Features (16-19)
      const f16_scroll_count = scrollCount.current;
      const f17_scroll_distance_mean = Number(calcMean(scrollDistances.current).toFixed(2));
      const f18_scroll_speed_mean = Number(calcMean(scrollSpeeds.current).toFixed(2));
      const f19_scroll_speed_variance = Number(calcVar(scrollSpeeds.current, f18_scroll_speed_mean).toFixed(2));

      // 5. Focus Features (20-22)
      const f20_focus_count = focusCount.current;
      const f21_blur_count = blurCount.current;
      const f22_visibility_change_count = visibilityChanges.current;

      // 6. Session Features (23-25)
      const isWindowIdle = (now - lastActivityTime.current) > 5000;
      if (isWindowIdle) idleTimeMs.current += intervalMs;
      else activeTimeMs.current += intervalMs;

      const f23_active_duration = Number((activeTimeMs.current / 1000.0).toFixed(1));
      const f24_idle_duration = Number((idleTimeMs.current / 1000.0).toFixed(1));
      const f25_session_duration = Number(((now - sessionStartTime.current) / 1000.0).toFixed(1));

      // 7. Behavioral Variability Features (26-28)
      const totalEventsInWin = f1_mouse_event_count + f6_click_count + keyPressTimings.current.length + f16_scroll_count;
      const f26_interaction_frequency = Number((totalEventsInWin / winDurSec).toFixed(2));
      const f27_activity_variance = Number((f4_mouse_speed_variance + f11_key_hold_variance + f19_scroll_speed_variance).toFixed(2));
      const f28_temporal_entropy = Number((Math.log(totalEventsInWin + 1) * 0.25).toFixed(2));

      // Construct EXACT 28-Dimensional Vector
      const featureVector = [
        f1_mouse_event_count,
        f2_mouse_distance_mean,
        f3_mouse_speed_mean,
        f4_mouse_speed_variance,
        f5_mouse_direction_change_rate,
        f6_click_count,
        f7_click_interval_mean,
        f8_click_interval_variance,
        f9_double_click_rate,
        f10_key_hold_mean,
        f11_key_hold_variance,
        f12_key_flight_mean,
        f13_key_flight_variance,
        f14_typing_speed,
        f15_typing_speed_variance,
        f16_scroll_count,
        f17_scroll_distance_mean,
        f18_scroll_speed_mean,
        f19_scroll_speed_variance,
        f20_focus_count,
        f21_blur_count,
        f22_visibility_change_count,
        f23_active_duration,
        f24_idle_duration,
        f25_session_duration,
        f26_interaction_frequency,
        f27_activity_variance,
        f28_temporal_entropy
      ];

      setLatestFeatures(featureVector);
      setWindowCount(prev => prev + 1);
      setLastAnalysisTime(new Date().toLocaleTimeString());

      // Submit aggregated numeric vector to backend
      try {
        const result = await sendBehaviorWindow(featureVector, windowDurationSec);
        setLatestResult(result);

        const st = result.securityStatus || result.status;
        if (st === 'REAUTH_REQUIRED' && typeof window !== 'undefined' && !window.location.pathname.includes('/reauthenticate')) {
          window.location.href = '/reauthenticate';
        } else if (st === 'LOCKED' && typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
          localStorage.removeItem('behaviorlock_token');
          localStorage.removeItem('behaviorlock_user');
          window.location.href = '/login?locked=true';
        }
      } catch (err) {
        console.error("Window evaluation error:", err);
      }

      // WIPE TEMPORARY RAM BUFFERS FOR NEXT WINDOW
      mouseDistances.current = [];
      mouseSpeeds.current = [];
      mouseDirChanges.current = 0;
      mouseEventCount.current = 0;
      clickTimes.current = [];
      clickTypes.current = { left: 0, right: 0 };
      doubleClicks.current = 0;
      keyPressTimings.current = [];
      scrollDistances.current = [];
      scrollSpeeds.current = [];
      scrollCount.current = 0;
      windowStartTime.current = Date.now();
    }, intervalMs);

    return () => clearInterval(windowTimer);
  }, [isMonitoringActive, windowDurationSec]);

  return {
    isIdle,
    windowCount,
    eventCount,
    lastAnalysisTime,
    latestResult,
    latestFeatures,
    sessionDurationSec
  };
}
