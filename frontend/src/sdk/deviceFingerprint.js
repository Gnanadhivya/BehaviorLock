/**
 * BehaviorLock Privacy-Conscious Device Fingerprinting SDK
 * 
 * STRICT PRIVACY ASSURANCE:
 * - Collects ONLY non-sensitive browser & hardware spec parameters for multi-device session management.
 * - ZERO text, typed characters, passwords, key codes, clipboard contents, or mouse trajectories collected.
 */

async function sha256Hex(str) {
  if (typeof window !== 'undefined' && window.crypto && window.crypto.subtle) {
    const encoder = new TextEncoder();
    const data = encoder.encode(str);
    const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }
  
  // Fallback simple hash string if crypto.subtle is unavailable
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return 'fp_' + Math.abs(hash).toString(16);
}

function parseBrowserAndOS() {
  const ua = typeof navigator !== 'undefined' ? navigator.userAgent : 'Unknown';
  
  let browser = 'Chrome / Web Browser';
  if (ua.includes('Firefox')) browser = 'Firefox';
  else if (ua.includes('Edg')) browser = 'Microsoft Edge';
  else if (ua.includes('Safari') && !ua.includes('Chrome')) browser = 'Safari';
  else if (ua.includes('Chrome')) browser = 'Chrome';

  let os = 'Windows Desktop';
  if (ua.includes('Mac OS')) os = 'macOS';
  else if (ua.includes('Linux')) os = 'Linux';
  else if (ua.includes('Android')) os = 'Android';
  else if (ua.includes('iPhone') || ua.includes('iPad')) os = 'iOS';
  else if (ua.includes('Windows')) os = 'Windows';

  return { browser, os };
}

export async function getDeviceFingerprint() {
  const { browser, os } = parseBrowserAndOS();
  const screenResolution = typeof window !== 'undefined' && window.screen 
    ? `${window.screen.width}x${window.screen.height}` 
    : '1920x1080';
  
  const timezone = typeof Intl !== 'undefined' && Intl.DateTimeFormat 
    ? Intl.DateTimeFormat().resolvedOptions().timeZone 
    : 'UTC';
    
  const language = typeof navigator !== 'undefined' ? (navigator.language || 'en-US') : 'en-US';

  const rawPayload = `${browser}|${os}|${screenResolution}|${timezone}|${language}`;
  const deviceFingerprint = await sha256Hex(rawPayload);

  return {
    deviceFingerprint,
    deviceName: `${browser} on ${os}`,
    browser,
    operatingSystem: os,
    screenResolution,
    timezone,
    language
  };
}
