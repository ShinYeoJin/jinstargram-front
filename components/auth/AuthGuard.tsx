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
      try {
        await getProfile(false) // silent=false: 정상 에러로 처리
        setIsAuthenticated(true)
      } catch (error: any) {
        // 401 에러는 인증 실패이므로 로그인 페이지로 리다이렉트
        if (error?.response?.status === 401 || error?.statusCode === 401) {
          router.push(redirectTo)
        } else {
          // 다른 에러도 인증 실패로 간주
          router.push(redirectTo)
        }
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

