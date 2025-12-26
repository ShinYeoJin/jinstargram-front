'use client'

import { useEffect, useState, ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { getProfile } from '@/services/auth'

interface AuthGuardProps {
  children: ReactNode
  redirectTo?: string
}

export default function AuthGuard({
  children,
  redirectTo = '/login',
}: AuthGuardProps) {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)

  useEffect(() => {
    const checkAuth = async () => {
      // 쿠키 방식: API 호출로 인증 상태 확인 (쿠키는 자동으로 전송됨)
      // localStorage 플래그는 무시하고 실제 API 결과를 신뢰
      try {
        await getProfile(true) // silent=true: 401 에러 조용히 처리
        // API 성공 = 인증 성공
        setIsAuthenticated(true)
        // 로그인 성공 시 플래그 저장 (다음 렌더링 시 힌트로 사용)
        if (typeof window !== 'undefined') {
          localStorage.setItem('isLoggedIn', 'true')
        }
      } catch (error: any) {
        // API 실패 = 인증 실패 (401 에러)
        // localStorage 플래그는 무시하고 실제 API 결과를 신뢰
        setIsAuthenticated(false)
        // 로그아웃 시 플래그 제거
        if (typeof window !== 'undefined') {
          localStorage.removeItem('isLoggedIn')
        }
        router.push(redirectTo)
      }
    }

    checkAuth()
  }, [router, redirectTo])

  // 인증 상태 확인 중
  if (isAuthenticated === null) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh'
      }}>
        <p>로딩 중...</p>
      </div>
    )
  }

  // 인증되지 않은 경우 (리다이렉트 중)
  if (!isAuthenticated) {
    return null
  }

  // 인증된 경우 자식 컴포넌트 렌더링
  return <>{children}</>
}

