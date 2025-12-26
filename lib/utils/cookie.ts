/**
 * 쿠키 관리 유틸리티 함수
 * HttpOnly 쿠키는 JavaScript로 접근할 수 없으므로,
 * 백엔드에서 쿠키를 설정하고 프론트엔드는 쿠키를 사용만 함
 */

/**
 * 쿠키 설정 (클라이언트 사이드용, HttpOnly는 백엔드에서 설정)
 */
export const setCookie = (name: string, value: string, days: number = 7): void => {
  if (typeof window === 'undefined') return;
  
  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
  
  document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Lax`;
};

/**
 * 쿠키 조회 (HttpOnly가 아닌 경우에만 가능)
 */
export const getCookie = (name: string): string | null => {
  if (typeof window === 'undefined') return null;
  
  const nameEQ = name + '=';
  const ca = document.cookie.split(';');
  
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === ' ') c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0) {
      return c.substring(nameEQ.length, c.length);
    }
  }
  return null;
};

/**
 * 쿠키 제거
 */
export const removeCookie = (name: string): void => {
  if (typeof window === 'undefined') return;
  
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
};

/**
 * 모든 쿠키 제거
 */
export const clearAllCookies = (): void => {
  if (typeof window === 'undefined') return;
  
  const cookies = document.cookie.split(';');
  for (let i = 0; i < cookies.length; i++) {
    const cookie = cookies[i];
    const eqPos = cookie.indexOf('=');
    const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
    removeCookie(name);
  }
};

