/**
 * deviceDetection - Utilitaires de détection d'appareil
 * Fournit des fonctions pour détecter le type d'appareil et les capacités
 */

export interface DeviceInfo {
  isMobile: boolean
  isTablet: boolean
  isDesktop: boolean
  isTouchDevice: boolean
  isIOS: boolean
  isAndroid: boolean
  userAgent: string
  pixelRatio: number
}

export function getDeviceInfo(): DeviceInfo {
  // Fallback values for SSR
  if (typeof window === 'undefined') {
    return {
      isMobile: false,
      isTablet: false,
      isDesktop: true,
      isTouchDevice: false,
      isIOS: false,
      isAndroid: false,
      userAgent: '',
      pixelRatio: 1,
    }
  }

  const userAgent = window.navigator.userAgent

  // Mobile detection
  const mobileRegex = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i
  const isMobileUA = mobileRegex.test(userAgent)

  // iOS detection
  const isIOS = /iPad|iPhone|iPod/.test(userAgent)

  // Android detection
  const isAndroid = /Android/.test(userAgent)

  // Touch detection
  const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0

  // Screen-based detection
  const screenWidth = window.screen.width
  const isMobileScreen = screenWidth <= 768
  const isTabletScreen = screenWidth > 768 && screenWidth <= 1024

  // Combine detections
  const isMobile = isMobileUA || (isMobileScreen && isTouchDevice)
  const isTablet = !isMobile && (isTabletScreen || (screenWidth <= 1024 && isTouchDevice))
  const isDesktop = !isMobile && !isTablet

  return {
    isMobile,
    isTablet,
    isDesktop,
    isTouchDevice,
    isIOS,
    isAndroid,
    userAgent,
    pixelRatio: window.devicePixelRatio || 1,
  }
}

export function isTouchDevice(): boolean {
  return getDeviceInfo().isTouchDevice
}

export function isRetinalDisplay(): boolean {
  return getDeviceInfo().pixelRatio > 1
}

export function getViewportSize() {
  if (typeof window === 'undefined') {
    return { width: 0, height: 0 }
  }

  return {
    width: window.innerWidth,
    height: window.innerHeight,
  }
}

export function getSafeAreaInsets() {
  if (typeof window === 'undefined') {
    return { top: 0, right: 0, bottom: 0, left: 0 }
  }

  const style = getComputedStyle(document.documentElement)

  return {
    top: parseInt(style.getPropertyValue('env(safe-area-inset-top)') || '0', 10),
    right: parseInt(style.getPropertyValue('env(safe-area-inset-right)') || '0', 10),
    bottom: parseInt(style.getPropertyValue('env(safe-area-inset-bottom)') || '0', 10),
    left: parseInt(style.getPropertyValue('env(safe-area-inset-left)') || '0', 10),
  }
}

export function detectOrientation(): 'portrait' | 'landscape' {
  if (typeof window === 'undefined') return 'portrait'

  return window.innerHeight > window.innerWidth ? 'portrait' : 'landscape'
}

export function supportsWebP(): boolean {
  if (typeof window === 'undefined') return false

  const canvas = document.createElement('canvas')
  canvas.width = 1
  canvas.height = 1

  return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0
}

export function supportsAvif(): boolean {
  if (typeof window === 'undefined') return false

  const canvas = document.createElement('canvas')
  canvas.width = 1
  canvas.height = 1

  try {
    return canvas.toDataURL('image/avif').indexOf('data:image/avif') === 0
  } catch {
    return false
  }
}

export function getOptimalImageFormat(): 'avif' | 'webp' | 'jpg' {
  if (supportsAvif()) return 'avif'
  if (supportsWebP()) return 'webp'
  return 'jpg'
}

export function getConnectionSpeed(): 'slow' | 'fast' | 'unknown' {
  if (typeof navigator === 'undefined' || !('connection' in navigator)) {
    return 'unknown'
  }

  const connection = (navigator as any).connection
  if (!connection) return 'unknown'

  // 4G and above are considered fast
  if (connection.effectiveType === '4g' || connection.effectiveType === '5g') {
    return 'fast'
  }

  // 3G and below are considered slow
  if (connection.effectiveType === '3g' || connection.effectiveType === '2g' || connection.effectiveType === 'slow-2g') {
    return 'slow'
  }

  return 'unknown'
}