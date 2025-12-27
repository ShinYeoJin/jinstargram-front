/**
 * 인증 관련 커스텀 훅 (로그인 액션만 제공)
 */

import { useState, useCallback } from 'react';
import { login, getProfile } from '@/services/auth';
import type { LoginRequest, LoginResponse } from '@/types/auth';
import { useAuthContext } from '@/contexts/AuthContext';

export interface UseAuthReturn {
  isLoading: boolean;
  error: string | null;
  login: (credentials: LoginRequest) => Promise<void>;
  clearError: () => void;
}

export function useAuth(): UseAuthReturn {
  const { setAuthState } = useAuthContext();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = useCallback(
    async (credentials: LoginRequest) => {
      setIsLoading(true);
      setError(null);

      try {
        // 1. 로그인 API 호출
        await login(credentials);

        // 2. 로그인 성공 후 즉시 getProfile 호출
        //    getProfile 성공 시에만 isLoggedIn = true
        try {
          const profileData = await getProfile(false);
          // getProfile 성공 = 인증 완료
          setAuthState(true, profileData);
        } catch (profileError) {
          // getProfile 실패 = 인증 실패로 처리
          setAuthState(false, null);
          setError('프로필을 불러올 수 없습니다. 다시 로그인해주세요.');
          throw profileError;
        }
      } catch (err: unknown) {
        // 로그인 API 자체가 실패한 경우
        if (err && typeof err === 'object' && 'message' in err) {
          const errorResponse = err as { message: string | string[]; statusCode?: number; error?: string };
          const errorMessage = typeof errorResponse.message === 'string' 
            ? errorResponse.message 
            : errorResponse.message.join(', ');
          
          if (errorResponse.statusCode === 0 || errorResponse.error === 'Network Error') {
            setError('서버에 연결할 수 없습니다. 네트워크 연결을 확인해주세요.');
          } else if (!error) {
            // 이미 에러가 설정되지 않은 경우에만
            setError(errorMessage || '아이디 또는 비밀번호가 올바르지 않습니다.');
          }
        } else if (!error) {
          setError('로그인 중 오류가 발생했습니다. 다시 시도해주세요.');
        }
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [setAuthState, error]
  );

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    isLoading,
    error,
    login: handleLogin,
    clearError,
  };
}

