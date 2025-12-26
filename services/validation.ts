import { apiClient } from '@/lib/api/client'

/**
 * 아이디 사용 가능 여부 확인
 */
export const checkUsernameAvailability = async (username: string): Promise<boolean> => {
  try {
    if (!username || username.trim().length < 4) {
      return false
    }
    const response = await apiClient.get<{ available: boolean }>('/auth/check-username', {
      params: { username: username.trim() }
    })
    return response.data.available
  } catch (error) {
    console.error('아이디 중복 체크 에러:', error)
    return false
  }
}

/**
 * 닉네임 사용 가능 여부 확인
 */
export const checkNicknameAvailability = async (nickname: string): Promise<boolean> => {
  try {
    if (!nickname || nickname.trim().length < 2) {
      return false
    }
    const response = await apiClient.get<{ available: boolean }>('/auth/check-nickname', {
      params: { nickname: nickname.trim() }
    })
    return response.data.available
  } catch (error) {
    console.error('닉네임 중복 체크 에러:', error)
    return false
  }
}

