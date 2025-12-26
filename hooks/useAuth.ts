/**
 * 인증 관련 커스텀 훅 (로그인 액션만 제공)
 */

import { useState, useCallback } from 'react';
import { login } from '@/services/auth';
import type { LoginRequest, LoginResponse } from '@/types/auth';
import { getErrorMessage } from '@/lib/utils/errorHandler';
import { useAuthContext } from '@/contexts/AuthContext';

export interface UseAuthReturn {
  isLoading: boolean;
  error: string | null;
  login: (credentials: LoginRequest) => Promise<void>;
  clearError: () => void;
}

export function useAuth(): UseAuthReturn {
  const { checkAuth, setLoggedIn } = useAuthContext(); // AuthContext에서 checkAuth와 setLoggedIn 가져오기
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = useCallback(
    async (credentials: LoginRequest) => {
      setIsLoading(true);
      setError(null);

      try {
        const response: LoginResponse = await login(credentials);

        // 로그인 성공 시 즉시 상태 업데이트 (API 호출 전)
        // 이렇게 하면 Navbar가 즉시 리렌더링됨
        setLoggedIn(true)

        // localStorage에 로그인 플래그 저장
        if (typeof window !== 'undefined') {
          localStorage.setItem('isLoggedIn', 'true')
        }

        // 프로필 데이터는 나중에 로드 (쿠키 설정 대기)
        setTimeout(() => {
          checkAuth()
        }, 100)
        setTimeout(() => {
          checkAuth()
        }, 300)
        setTimeout(() => {
          checkAuth()
        }, 600)

        // auth-change 이벤트도 발생 (다른 컴포넌트 업데이트용)
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new Event('auth-change'));
        }

        // 성공 모달이 표시된 후 리다이렉트하도록 하기 위해
        // 여기서는 리다이렉트하지 않고, 성공 모달에서 처리하도록 함
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
    [checkAuth]
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

