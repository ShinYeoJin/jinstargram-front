// 인증 관련 타입 정의

// 로그인 요청
export interface LoginRequest {
  id: string;
  password: string;
}

// 회원가입 요청
export interface SignupRequest {
  id: string;
  password: string;
  nickname: string;
  profileImageUrl?: string;
}

// 로그인 응답
export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  user: User;
}

// 토큰 갱신 응답
export interface RefreshTokenResponse {
  access_token: string;
}

// 회원가입 응답
export type SignupResponse = boolean;

// 프로필 응답
export interface ProfileResponse {
  id: number;
  username: string;
  nickname: string | null;
  profileImageUrl: string | null;
  bio: string | null;
  email: string | null;
  createdAt: string;
  updatedAt: string;
}

// 사용자 정보
export interface User {
  id: number;
  username: string;
  nickname: string | null;
  profileImageUrl: string | null;
  bio: string | null;
  email: string | null;
  createdAt: string;
  updatedAt: string;
}

// API 에러 응답
export interface ApiError {
  statusCode: number;
  message: string | string[];
  error: string;
}

