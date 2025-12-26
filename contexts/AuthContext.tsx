'use client'

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'
import { getProfile, logout as logoutService } from '@/services/auth'
import type { ProfileResponse } from '@/types/auth'

interface AuthContextType {
  isLoggedIn: boolean | null // null: unknown, true: authenticated, false: unauthenticated
  profile: ProfileResponse | null
  checkAuth: () => Promise<void>
  setLoggedIn: (value: boolean) => void // 로그인 성공 시 즉시 상태 업데이트
  handleLogout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  // 단일 auth 상태 인스턴스 (오직 여기서만 생성)
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null)
  const [profile, setProfile] = useState<ProfileResponse | null>(null)

  // Context 인스턴스 ID 생성 및 저장 (런타임 증명용)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const ctxId = Math.random().toString(36).substring(2, 15)
      ;(window as any).__AUTH_CTX_ID = ctxId
      console.log('[AuthProvider] mounted', ctxId)
    }
  }, [])

  // 인증 상태 확인 함수
  const checkAuth = useCallback(async () => {
    try {
      const profileData = await getProfile(true) // silent 모드로 호출 (401 에러 조용히 처리)
      // API 성공 = 인증 성공
      setIsLoggedIn(true)
      setProfile(profileData)
      // 로그인 성공 시 플래그 저장
      if (typeof window !== 'undefined') {
        localStorage.setItem('isLoggedIn', 'true')
      }
    } catch (error: any) {
      // API 실패 = 인증 실패 (401 에러)
      setIsLoggedIn(false)
      setProfile(null)
      // 로그아웃 시 플래그 제거
      if (typeof window !== 'undefined') {
        localStorage.removeItem('isLoggedIn')
      }
    }
  }, [])

  // 로그인 성공 시 즉시 상태 업데이트 (API 호출 전)
  const setLoggedIn = useCallback((value: boolean) => {
    const ctxId = typeof window !== 'undefined' ? (window as any).__AUTH_CTX_ID : 'N/A'
    console.log('[Login] setLoggedIn', value, ctxId)
    setIsLoggedIn(value)
    if (!value) {
      setProfile(null)
      if (typeof window !== 'undefined') {
        localStorage.removeItem('isLoggedIn')
      }
    } else {
      if (typeof window !== 'undefined') {
        localStorage.setItem('isLoggedIn', 'true')
      }
    }
  }, [])

  // 로그아웃 처리
  const handleLogout = useCallback(async () => {
    try {
      await logoutService()
    } catch (error) {
      console.error('로그아웃 에러:', error)
    } finally {
      // 상태 즉시 업데이트
      setIsLoggedIn(false)
      setProfile(null)
      // localStorage에서 로그인 플래그 제거
      if (typeof window !== 'undefined') {
        localStorage.removeItem('isLoggedIn')
      }
    }
  }, [])

  // 초기 인증 상태 확인
  useEffect(() => {
    checkAuth()

    // auth-change 이벤트 리스너 (로그인 성공 시 Navbar 업데이트)
    const handleAuthChange = () => {
      // 쿠키 설정 대기 (100ms 지연)
      setTimeout(() => {
        checkAuth()
      }, 100)
    }

    window.addEventListener('auth-change', handleAuthChange)

    return () => {
      window.removeEventListener('auth-change', handleAuthChange)
    }
  }, [checkAuth])

  return (
    <AuthContext.Provider value={{ isLoggedIn, profile, checkAuth, setLoggedIn, handleLogout }}>
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

