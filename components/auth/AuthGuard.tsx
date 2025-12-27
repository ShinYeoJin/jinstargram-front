'use client'

import { useEffect, ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthContext } from '@/contexts/AuthContext'

interface AuthGuardProps {
  children: ReactNode
  redirectTo?: string
}

export default function AuthGuard({
  children,
  redirectTo = '/login',
}: AuthGuardProps) {
  const router = useRouter()
  const { isLoggedIn } = useAuthContext() // AuthContext에서 단일 auth 상태 소비

  useEffect(() => {
    // 인증되지 않은 경우 리다이렉트
    if (isLoggedIn === false) {
      router.push(redirectTo)
    }
  }, [isLoggedIn, router, redirectTo])

  // 인증 상태 확인 중
  if (isLoggedIn === null) {
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
  if (isLoggedIn === false) {
    return null
  }

  // 인증된 경우 자식 컴포넌트 렌더링
  return <>{children}</>
}

