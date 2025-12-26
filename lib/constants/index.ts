/**
 * 애플리케이션 상수 정의
 */

// API 설정
export const API_TIMEOUT = 10000; // 10초
export const DEBOUNCE_DELAY = 500; // 500ms

// 유효성 검사 규칙
export const VALIDATION_RULES = {
  USERNAME: {
    MIN_LENGTH: 4,
    PATTERN: /^[a-zA-Z0-9_]+$/,
  },
  PASSWORD: {
    MIN_LENGTH: 8,
    REQUIRE_LETTER: true,
    REQUIRE_NUMBER: true,
  },
  NICKNAME: {
    MIN_LENGTH: 2,
    MAX_LENGTH: 20,
  },
} as const;

// 이미지 업로드 설정
export const IMAGE_UPLOAD = {
  MAX_SIZE_MB: 5,
  ALLOWED_TYPES: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
} as const;

// 토큰 키
export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'access_token',
  REFRESH_TOKEN: 'refresh_token',
} as const;

// 라우트 경로
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  SIGNUP: '/signup',
  PROFILE: '/profile',
} as const;

// 에러 메시지
export const ERROR_MESSAGES = {
  NETWORK: '서버에 연결할 수 없습니다. 네트워크를 확인해주세요.',
  UNAUTHORIZED: '인증이 필요합니다. 다시 로그인해주세요.',
  FORBIDDEN: '접근 권한이 없습니다.',
  NOT_FOUND: '요청한 리소스를 찾을 수 없습니다.',
  SERVER_ERROR: '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
  UNKNOWN: '알 수 없는 오류가 발생했습니다.',
} as const;

// 성공 메시지
export const SUCCESS_MESSAGES = {
  SIGNUP: '회원가입이 완료되었습니다.',
  LOGIN: '로그인되었습니다.',
  PROFILE_UPDATE: '프로필이 업데이트되었습니다.',
} as const;

// 날짜 포맷팅 상수
export const DATE_FORMAT = {
  DAYS_IN_WEEK: 7,
  MILLISECONDS_PER_MINUTE: 1000 * 60,
  MILLISECONDS_PER_HOUR: 1000 * 60 * 60,
  MILLISECONDS_PER_DAY: 1000 * 60 * 60 * 24,
  LOCALE: 'ko-KR',
} as const;

// 슬라이드 스크롤 속도
export const SCROLL_SPEED = {
  MULTIPLIER: 2, // 드래그 거리 대비 스크롤 속도 배율
} as const;

// 프로필 공유 설정
export const SHARE_CONFIG = {
  TITLE_SUFFIX: '님의 프로필',
  TEXT_SUFFIX: '님의 프로필을 확인해보세요!',
  SUCCESS_MESSAGE_SHARE: '프로필이 공유되었습니다.',
  SUCCESS_MESSAGE_CLIPBOARD: '프로필 링크가 클립보드에 복사되었습니다.',
  FAILURE_MESSAGE: '공유에 실패했습니다. 다시 시도해주세요.',
} as const;

