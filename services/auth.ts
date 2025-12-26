import { apiClient } from '@/lib/api/client';
import { handleApiError, getErrorMessage } from '@/lib/utils/errorHandler';
import type {
  LoginRequest,
  LoginResponse,
  SignupRequest,
  SignupResponse,
  ProfileResponse,
  RefreshTokenResponse,
  ApiError,
} from '@/types/auth';

/**
 * 회원가입 API
 * @param signupData 회원가입 데이터
 * @returns 성공 시 true
 * @throws 에러 발생 시 에러 객체
 */
export const signup = async (
  signupData: SignupRequest
): Promise<SignupResponse> => {
  try {
    const response = await apiClient.post<SignupResponse>(
      '/auth/signup',
      signupData
    );
    return response.data;
  } catch (error: any) {
    throw handleApiError(error);
  }
};

/**
 * 로그인 API
 * @param loginData 로그인 데이터 (아이디, 비밀번호)
 * @returns 로그인 응답 (access_token, user 정보)
 * @throws 에러 발생 시 에러 객체
 */
export const login = async (
  loginData: LoginRequest
): Promise<LoginResponse> => {
  try {
    const response = await apiClient.post<LoginResponse>(
      '/auth/login',
      loginData
    );

    // 토큰은 백엔드에서 쿠키로 설정되므로 프론트엔드에서는 별도 저장 불필요
    // 응답 데이터만 반환
    return response.data;
  } catch (error: any) {
    throw handleApiError(error);
  }
};

/**
 * 토큰 갱신 API
 * @param refreshToken 리프레시 토큰
 * @returns 새로운 Access Token
 * @throws 에러 발생 시 에러 객체
 */
export const refreshToken = async (): Promise<RefreshTokenResponse> => {
  try {
    // Refresh Token은 쿠키에 저장되어 있으므로 body에 포함하지 않음
    // 백엔드가 쿠키에서 자동으로 읽어서 처리
    const response = await apiClient.post<RefreshTokenResponse>('/auth/refresh');
    
    // 새로운 Access Token은 백엔드에서 쿠키로 설정되므로 별도 저장 불필요
    return response.data;
  } catch (error: any) {
    // 에러는 백엔드에서 처리되므로 프론트엔드에서는 에러만 전달
    throw handleApiError(error);
  }
};

/**
 * 로그아웃
 * 토큰 제거 및 서버에 로그아웃 요청
 * Access Token이 만료되어도 Refresh Token만으로 로그아웃 가능
 */
export const logout = async (): Promise<void> => {
  try {
    // 서버에 로그아웃 요청 (쿠키에서 자동으로 토큰 읽어서 처리)
    // Refresh Token은 쿠키에 저장되어 있으므로 body에 포함하지 않음
    await apiClient.post('/auth/logout');
  } catch (error: any) {
    // 에러가 발생해도 쿠키는 백엔드에서 제거되므로 프론트엔드에서는 에러만 로그
    console.error('로그아웃 에러:', error);
  }
  // 쿠키는 백엔드에서 제거되므로 프론트엔드에서는 별도 처리 불필요
};

/**
 * 프로필 조회 API
 * @returns 사용자 프로필 정보
 * @throws 에러 발생 시 에러 객체
 */
export const getProfile = async (): Promise<ProfileResponse> => {
  try {
    const response = await apiClient.get<ProfileResponse>('/auth/profile');
    return response.data;
  } catch (error: any) {
    // 401 에러는 로그인하지 않은 상태이므로 조용히 처리
    if (error?.response?.status === 401 || error?.statusCode === 401) {
      // 401 에러를 조용히 처리하기 위해 특별한 에러 객체 생성
      const silentError: any = new Error('Unauthorized');
      silentError.statusCode = 401;
      silentError.response = { status: 401 };
      silentError.isSilent = true; // 조용한 에러 플래그
      throw silentError;
    }
    throw handleApiError(error);
  }
};

/**
 * 프로필 업데이트 API
 * @param updateData 업데이트할 프로필 데이터
 * @returns 업데이트된 프로필 정보
 * @throws 에러 발생 시 에러 객체
 */
export const updateProfile = async (updateData: {
  nickname?: string;
  profileImageUrl?: string | null;
  bio?: string | null;
}): Promise<ProfileResponse> => {
  try {
    const response = await apiClient.patch<ProfileResponse>(
      '/auth/profile',
      updateData
    );
    return response.data;
  } catch (error: any) {
    throw handleApiError(error);
  }
};

