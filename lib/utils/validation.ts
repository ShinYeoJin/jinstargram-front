/**
 * 폼 유효성 검사 유틸리티 함수
 */

import { VALIDATION_RULES } from '@/lib/constants'

// 아이디 유효성 검사: 4자 이상
export const validateUsername = (username: string): boolean => {
  return username.length >= 4
}

// 비밀번호 유효성 검사: 8자 이상, 영문 + 숫자 포함
export const validatePassword = (password: string): boolean => {
  if (password.length < VALIDATION_RULES.PASSWORD.MIN_LENGTH) return false
  const hasLetter = /[a-zA-Z]/.test(password)
  const hasNumber = /[0-9]/.test(password)
  return hasLetter && hasNumber
}

// 비밀번호 확인 유효성 검사: 비밀번호와 일치
export const validateConfirmPassword = (
  confirmPassword: string,
  password: string
): boolean => {
  return confirmPassword === password && confirmPassword !== ''
}

// 닉네임 유효성 검사 (2-20자)
export const validateNickname = (nickname: string): boolean => {
  return nickname.length >= VALIDATION_RULES.NICKNAME.MIN_LENGTH && 
         nickname.length <= VALIDATION_RULES.NICKNAME.MAX_LENGTH;
}

// 아이디 에러 메시지 생성
export const getUsernameError = (
  username: string,
  touched: boolean
): string => {
  if (!touched) return ''
  if (username.length === 0) return '아이디를 입력해주세요.'
  if (username.length < VALIDATION_RULES.USERNAME.MIN_LENGTH) {
    return `아이디는 ${VALIDATION_RULES.USERNAME.MIN_LENGTH}자 이상 입력해주세요.`
  }
  return ''
}

// 비밀번호 에러 메시지 생성
export const getPasswordError = (
  password: string,
  touched: boolean
): string => {
  if (!touched) return ''
  if (password.length === 0) return '비밀번호를 입력해주세요.'
  if (password.length < VALIDATION_RULES.PASSWORD.MIN_LENGTH) {
    return `비밀번호는 ${VALIDATION_RULES.PASSWORD.MIN_LENGTH}자 이상 입력해주세요.`
  }
  const hasLetter = /[a-zA-Z]/.test(password)
  const hasNumber = /[0-9]/.test(password)
  if (!hasLetter || !hasNumber) {
    return '비밀번호는 영문과 숫자를 포함해야 합니다.'
  }
  return ''
}

// 비밀번호 확인 에러 메시지 생성
export const getConfirmPasswordError = (
  confirmPassword: string,
  password: string,
  touched: boolean
): string => {
  if (!touched) return ''
  if (confirmPassword.length === 0) return '비밀번호 확인을 입력해주세요.'
  if (confirmPassword !== password) {
    return '비밀번호가 일치하지 않습니다.'
  }
  return ''
}

// 닉네임 에러 메시지 생성
export const getNicknameError = (
  nickname: string,
  touched: boolean
): string => {
  if (!touched) return ''
  if (nickname.length === 0) return '닉네임을 입력해주세요.'
  if (nickname.length < VALIDATION_RULES.NICKNAME.MIN_LENGTH || 
      nickname.length > VALIDATION_RULES.NICKNAME.MAX_LENGTH) {
    return `닉네임은 ${VALIDATION_RULES.NICKNAME.MIN_LENGTH}-${VALIDATION_RULES.NICKNAME.MAX_LENGTH}자로 입력해주세요.`
  }
  return ''
}

