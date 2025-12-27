'use client'

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'
import { getProfile, logout as logoutService } from '@/services/auth'
import type { ProfileResponse } from '@/types/auth'

interface AuthContextType {
  isLoggedIn: boolean | null // null: 확인 중, true: 인증됨, false: 미인증
  profile: ProfileResponse | null
  checkAuth: () => Promise<boolean> // 인증 성공 여부 반환
  setAuthState: (isLoggedIn: boolean, profile: ProfileResponse | null) => void
  handleLogout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null)
  const [profile, setProfile] = useState<ProfileResponse | null>(null)

  /**
   * 인증 상태 확인 함수
   * 단일 기준: getProfile API가 200으로 성공하는가
   * @returns 인증 성공 여부
   */
  const checkAuth = useCallback(async (): Promise<boolean> => {
    try {
      const profileData = await getProfile(true)
      // getProfile 성공 = 인증됨
      setIsLoggedIn(true)
      setProfile(profileData)
      return true
    } catch (error: any) {
      // getProfile 실패 = 미인증 (무조건)
      setIsLoggedIn(false)
      setProfile(null)
      return false
    }
  }, [])

  /**
   * 로그인 성공 시 상태 직접 설정 (getProfile 결과와 함께)
   */
  const setAuthState = useCallback((loggedIn: boolean, profileData: ProfileResponse | null) => {
    setIsLoggedIn(loggedIn)
    setProfile(profileData)
  }, [])

  /**
   * 로그아웃 처리
   */
  const handleLogout = useCallback(async () => {
    try {
      await logoutService()
    } catch (error) {
      console.error('로그아웃 에러:', error)
    } finally {
      // 상태 즉시 업데이트
      setIsLoggedIn(false)
      setProfile(null)
    }
  }, [])

  // 초기 인증 상태 확인 (앱 로드 시)
  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  return (
    <AuthContext.Provider value={{ isLoggedIn, profile, checkAuth, setAuthState, handleLogout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuthContext() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider')
  }
  return context
}

