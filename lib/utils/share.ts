/**
 * 공유 기능 유틸리티
 */

/**
 * 프로필 URL 생성
 */
export const getProfileUrl = (username: string): string => {
  if (typeof window === 'undefined') {
    return '';
  }
  const baseUrl = window.location.origin;
  // 현재 프로필 URL 구조: /profile?user={username}
  // 향후 개별 사용자 프로필 페이지가 추가되면 /user/{username} 형식으로 변경 가능
  return `${baseUrl}/profile?user=${username}`;
};

/**
 * 클립보드에 텍스트 복사
 */
export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    } else {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      try {
        document.execCommand('copy');
        document.body.removeChild(textArea);
        return true;
      } catch (err) {
        document.body.removeChild(textArea);
        return false;
      }
    }
  } catch (error) {
    console.error('클립보드 복사 실패:', error);
    return false;
  }
};

/**
 * Web Share API를 사용한 공유 (모바일에서 주로 사용)
 */
export const shareProfile = async (
  title: string,
  text: string,
  url: string
): Promise<boolean> => {
  try {
    // Web Share API 지원 여부 확인
    if (typeof navigator !== 'undefined' && 'share' in navigator) {
      await navigator.share({
        title,
        text,
        url,
      });
      return true;
    }
    return false;
  } catch (error: unknown) {
    // 사용자가 공유를 취소한 경우는 정상 동작
    if (error instanceof DOMException && error.name === 'AbortError') {
      return false;
    }
    console.error('공유 실패:', error);
    return false;
  }
};

/**
 * 프로필 공유 처리 (Web Share API 우선, 없으면 클립보드 복사)
 */
export const handleShareProfile = async (
  username: string,
  nickname: string
): Promise<{ success: boolean; method: 'share' | 'clipboard' | 'none'; message: string }> => {
  const profileUrl = getProfileUrl(username);
  const shareText = `${nickname}님의 프로필을 확인해보세요!`;

  // Web Share API 사용 가능 여부 확인
  if (typeof navigator !== 'undefined' && 'share' in navigator) {
    try {
      const shared = await shareProfile(
        `${nickname}님의 프로필`,
        shareText,
        profileUrl
      );
      if (shared) {
        return {
          success: true,
          method: 'share',
          message: '프로필이 공유되었습니다.',
        };
      }
    } catch (error) {
      // 공유 실패 시 클립보드로 fallback
    }
  }

  // 클립보드 복사
  const copied = await copyToClipboard(profileUrl);
  if (copied) {
    return {
      success: true,
      method: 'clipboard',
      message: '프로필 링크가 클립보드에 복사되었습니다.',
    };
  }

  return {
    success: false,
    method: 'none',
    message: '공유에 실패했습니다. 다시 시도해주세요.',
  };
};

