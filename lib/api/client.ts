import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { API_TIMEOUT } from '@/lib/constants';

// API 기본 URL 설정
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// Axios 인스턴스 생성
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: API_TIMEOUT,
  withCredentials: true, // 쿠키를 포함하여 요청 전송
});

// 요청 인터셉터: 쿠키는 자동으로 전송되므로 별도 처리 불필요
// HttpOnly 쿠키는 JavaScript로 접근할 수 없으므로 백엔드에서 처리
apiClient.interceptors.request.use(
  (config) => {
    // 쿠키는 withCredentials: true로 자동 전송됨
    // 필요시 추가 헤더 설정 가능
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 토큰 갱신 중 플래그 (무한 루프 방지)
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: any) => void;
  reject: (error?: any) => void;
}> = [];

// 대기 중인 요청 처리
const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// 응답 인터셉터: 에러 처리 및 토큰 자동 갱신
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
    
    // 401 에러이고 아직 재시도하지 않은 경우
    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      if (isRefreshing) {
        // 이미 토큰 갱신 중이면 대기열에 추가
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return apiClient(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      // Refresh Token은 쿠키에 저장되어 있으므로 백엔드가 자동으로 처리
      // 프론트엔드에서는 Refresh Token API를 호출하면 됨
      try {
        // Refresh Token으로 새 Access Token 발급 (쿠키에서 자동으로 읽음)
        const { refreshToken } = await import('@/services/auth');
        const response = await refreshToken(); // 쿠키에서 자동으로 읽으므로 파라미터 불필요

        // 새 토큰은 백엔드에서 쿠키로 설정되므로 별도 처리 불필요
        // 원래 요청 재시도 (새 쿠키가 자동으로 포함됨)
        processQueue(null, null);
        isRefreshing = false;

        return apiClient(originalRequest);
      } catch (refreshError) {
        // 토큰 갱신 실패 시 로그아웃 처리
        processQueue(refreshError, null);
        isRefreshing = false;
        
        // 쿠키는 백엔드에서 제거되므로 프론트엔드에서는 리다이렉트만
        if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

