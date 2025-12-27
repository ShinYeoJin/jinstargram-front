import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { API_TIMEOUT } from '@/lib/constants';

// API 기본 URL 설정
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// 디버깅: 환경 변수 확인 (항상 로깅 - 배포 문제 디버깅용)
if (typeof window !== 'undefined') {
  console.log('[API Client] Configuration:', {
    API_BASE_URL,
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NODE_ENV: process.env.NODE_ENV,
  });
}

// Axios 인스턴스 생성
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: API_TIMEOUT,
  withCredentials: true, // 쿠키를 포함하여 요청 전송
});

// 요청 인터셉터: Authorization 헤더 추가
apiClient.interceptors.request.use(
  (config) => {
    // ✅ localStorage에서 토큰 읽어서 Authorization 헤더 추가
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('access_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      console.log(`[API Request] ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`, {
        hasToken: !!token,
      });
    }
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
    // 디버깅: 모든 응답 로깅 (배포 문제 디버깅용)
    if (typeof window !== 'undefined') {
      console.log(`[API Response] ${response.config.method?.toUpperCase()} ${response.config.url}`, {
        status: response.status,
      });
    }
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
    
    // 401 에러이고 아직 재시도하지 않은 경우
    // 토큰 갱신을 시도하지 않는 엔드포인트들
    const isAuthEndpoint = originalRequest?.url?.includes('/auth/signup') || 
                           originalRequest?.url?.includes('/auth/login') ||
                           originalRequest?.url?.includes('/auth/logout') ||
                           originalRequest?.url?.includes('/auth/refresh');
    const isProfileRequest = originalRequest?.url?.includes('/auth/profile');
    
    // 프로필 요청의 401 에러는 조용히 처리 (로그인하지 않은 상태)
    if (isProfileRequest && error.response?.status === 401) {
      // 조용한 에러 플래그 추가 및 스택 제거
      const silentError: any = new Error('Unauthorized');
      silentError.statusCode = 401;
      silentError.response = error.response;
      silentError.isSilent = true;
      silentError.stack = undefined; // 스택 제거하여 콘솔에 표시되지 않도록
      return Promise.reject(silentError);
    }
    
    if (error.response?.status === 401 && originalRequest && !originalRequest._retry && !isAuthEndpoint && !isProfileRequest) {
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
        
        // 프로필 요청의 401 에러는 조용히 처리 (로그인하지 않은 상태)
        const isProfileRequest = originalRequest?.url?.includes('/auth/profile');
        if (isProfileRequest) {
          // 프로필 요청의 401은 정상적인 상황 (로그인하지 않음)
          return Promise.reject(refreshError);
        }
        
        // 회원가입/로그인 페이지에서는 리다이렉트하지 않음 (에러를 폼에서 처리)
        if (typeof window !== 'undefined') {
          const currentPath = window.location.pathname;
          if (currentPath !== '/login' && currentPath !== '/signup') {
            window.location.href = '/login';
          }
        }
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

