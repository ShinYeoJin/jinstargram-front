/**
 * 인증 관련 커스텀 훅
 */

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { login, logout as logoutService } from '@/services/auth';
import type { LoginRequest, LoginResponse } from '@/types/auth';
import { getErrorMessage } from '@/lib/utils/errorHandler';

export interface UseAuthReturn {
  isLoading: boolean;
  error: string | null;
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
}

export function useAuth(): UseAuthReturn {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = useCallback(
    async (credentials: LoginRequest) => {
      setIsLoading(true);
      setError(null);

      try {
        const response: LoginResponse = await login(credentials);

        // 네비게이션 바 업데이트를 위한 이벤트 발생
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new Event('auth-change'));
        }

        // 홈페이지로 리다이렉트
        router.push('/');
        router.refresh();
      } catch (err: unknown) {
        // err가 이미 ErrorResponse인지 확인
        if (err && typeof err === 'object' && 'message' in err) {
          const errorResponse = err as { message: string | string[]; statusCode?: number; error?: string };
          const errorMessage = typeof errorResponse.message === 'string' 
            ? errorResponse.message 
            : errorResponse.message.join(', ');
          
          // 네트워크 에러인 경우 더 구체적인 메시지 제공
          if (errorResponse.statusCode === 0 || errorResponse.error === 'Network Error') {
            setError('백엔드 서버에 연결할 수 없습니다. 백엔드 서버가 실행 중인지 확인해주세요. (http://localhost:3001)');
          } else {
            setError(errorMessage || '아이디 또는 비밀번호가 올바르지 않습니다.');
          }
        } else {
          setError('로그인 중 오류가 발생했습니다. 다시 시도해주세요.');
        }
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [router]
  );

  const handleLogout = useCallback(async () => {
    try {
      await logoutService();
      
      // 네비게이션 바 업데이트를 위한 이벤트 발생
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('auth-change'));
      }

      router.push('/login');
      router.refresh();
    } catch (err) {
      console.error('로그아웃 에러:', err);
    }
  }, [router]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    isLoading,
    error,
    login: handleLogin,
    logout: handleLogout,
    clearError,
  };
}

