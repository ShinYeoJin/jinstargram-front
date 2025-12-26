/**
 * 공통 에러 처리 유틸리티
 */

import type { ApiError } from '@/types/auth';

export interface ErrorResponse {
  statusCode: number;
  message: string | string[];
  error: string;
}

/**
 * Axios 에러를 표준화된 에러 형식으로 변환
 * @param error - Axios 에러 또는 일반 에러 객체
 * @returns 표준화된 에러 응답 객체
 */
export const handleApiError = (error: unknown): ErrorResponse => {
  // AxiosError 인스턴스 체크
  if (error && typeof error === 'object') {
    // Axios 에러인지 확인 (response 속성 존재)
    if ('response' in error) {
      const axiosError = error as { response?: { data?: ApiError; status?: number } };
      
      // 서버에서 에러 응답을 받은 경우
      if (axiosError.response) {
        const apiError = axiosError.response.data;
        return {
          statusCode: apiError?.statusCode || axiosError.response.status || 500,
          message: apiError?.message || '요청 처리에 실패했습니다.',
          error: apiError?.error || 'Bad Request',
        };
      }
    }
    
    // 요청은 보냈지만 응답을 받지 못한 경우 (네트워크 에러 또는 서버가 실행되지 않음)
    if ('request' in error) {
      return {
        statusCode: 0,
        message: '백엔드 서버에 연결할 수 없습니다. 백엔드 서버가 실행 중인지 확인해주세요. (http://localhost:3001)',
        error: 'Network Error',
      };
    }
    
    // AxiosError의 code 속성 확인 (ECONNREFUSED, ETIMEDOUT 등)
    if ('code' in error) {
      const code = (error as { code?: string }).code;
      if (code === 'ECONNREFUSED' || code === 'ETIMEDOUT' || code === 'ERR_NETWORK') {
        return {
          statusCode: 0,
          message: '백엔드 서버에 연결할 수 없습니다. 백엔드 서버가 실행 중인지 확인해주세요. (http://localhost:3001)',
          error: 'Network Error',
        };
      }
    }
  }
  
  // 일반 에러 객체인 경우
  if (error instanceof Error) {
    // 네트워크 관련 에러 메시지 확인
    if (error.message.includes('ECONNREFUSED') || 
        error.message.includes('Network Error') ||
        error.message.includes('ERR_NETWORK') ||
        error.message.includes('timeout')) {
      return {
        statusCode: 0,
        message: '백엔드 서버에 연결할 수 없습니다. 백엔드 서버가 실행 중인지 확인해주세요. (http://localhost:3001)',
        error: 'Network Error',
      };
    }
    
    return {
      statusCode: 0,
      message: error.message || '요청을 처리하는 중 오류가 발생했습니다.',
      error: 'Request Error',
    };
  }
  
  // 알 수 없는 에러
  return {
    statusCode: 0,
    message: '요청을 처리하는 중 오류가 발생했습니다.',
    error: 'Unknown Error',
  };
};

/**
 * 에러 메시지를 문자열로 변환
 */
export const getErrorMessage = (error: ErrorResponse): string => {
  if (Array.isArray(error.message)) {
    return error.message.join(', ');
  }
  return error.message;
};

/**
 * 에러 타입에 따른 기본 메시지 반환
 */
export const getDefaultErrorMessage = (errorType: string, action: string): string => {
  const messages: Record<string, Record<string, string>> = {
    'Network Error': {
      signup: '회원가입에 실패했습니다. 네트워크를 확인해주세요.',
      login: '로그인에 실패했습니다. 네트워크를 확인해주세요.',
      profile: '프로필 조회에 실패했습니다. 네트워크를 확인해주세요.',
      update: '프로필 업데이트에 실패했습니다. 네트워크를 확인해주세요.',
    },
    'Request Error': {
      signup: '회원가입 요청 중 오류가 발생했습니다.',
      login: '로그인 요청 중 오류가 발생했습니다.',
      profile: '프로필 조회 요청 중 오류가 발생했습니다.',
      update: '프로필 업데이트 요청 중 오류가 발생했습니다.',
    },
  };

  return messages[errorType]?.[action] || `${action}에 실패했습니다.`;
};

