'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { logout, getProfile } from '@/services/auth'
import type { ProfileResponse } from '@/types/auth'
import styles from './Navbar.module.css'

export default function Navbar() {
  // auth 상태: null(unknown) → true(authenticated) → false(unauthenticated)
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null)
  // profile 데이터는 auth와 분리하여 관리
  const [profile, setProfile] = useState<ProfileResponse | null>(null)
  const router = useRouter()
  const pathname = usePathname()

  // 인증 상태 확인 함수 (useCallback으로 최적화)
  const checkAuth = useCallback(async () => {
    // 쿠키 방식: API 호출로 인증 상태 확인 (쿠키는 자동으로 전송됨)
    // localStorage 플래그는 힌트일 뿐, 실제 인증은 API로 확인
    try {
      const profileData = await getProfile(true) // silent 모드로 호출 (401 에러 조용히 처리)
      // API 성공 = 인증 성공
      setIsLoggedIn(true)
      setProfile(profileData) // profile 데이터는 별도로 관리
      // 로그인 성공 시 플래그 저장 (다음 렌더링 시 힌트로 사용)
      if (typeof window !== 'undefined') {
        localStorage.setItem('isLoggedIn', 'true')
      }
    } catch (error: any) {
      // API 실패 = 인증 실패 (401 에러)
      // localStorage 플래그는 무시하고 실제 API 결과를 신뢰
      setIsLoggedIn(false)
      setProfile(null)
      // 로그아웃 시 플래그 제거
      if (typeof window !== 'undefined') {
        localStorage.removeItem('isLoggedIn')
      }
      // 조용한 에러가 아닌 경우에만 콘솔에 출력 (실제 에러만)
      if (!error?.isSilent && error?.statusCode !== 401 && error?.response?.status !== 401) {
        // 실제 에러만 콘솔에 출력 (401은 정상)
      }
    }
  }, [])

  // 인증 상태 확인 및 이벤트 리스너 등록
  useEffect(() => {
    // 초기 인증 상태 확인
    checkAuth()

    // 인증 상태 변경 감지를 위한 이벤트 리스너
    const handleAuthChange = () => {
      // 이벤트 발생 시 즉시 확인 (쿠키 설정 지연 대응을 위해 약간의 지연)
      setTimeout(() => {
        checkAuth()
      }, 100)
    }
    
    // 커스텀 이벤트 (로그인/로그아웃 시 발생)
    window.addEventListener('auth-change', handleAuthChange)

    // 페이지 포커스 시에도 상태 확인 (다른 탭에서 로그인한 경우)
    const handleFocus = () => {
      checkAuth()
    }
    window.addEventListener('focus', handleFocus)

    return () => {
      window.removeEventListener('auth-change', handleAuthChange)
      window.removeEventListener('focus', handleFocus)
    }
  }, [checkAuth, pathname]) // checkAuth와 pathname을 dependency로 추가하여 pathname 변경 시에도 checkAuth 실행

  const handleLogout = async () => {
    try {
      // 로그아웃 API 호출
      await logout()
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
      
      // 로그아웃 이벤트 발생 (다른 컴포넌트도 업데이트되도록)
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('auth-change'))
      }
      
      // 로그인 페이지로 리다이렉트
      router.push('/login')
      router.refresh()
    }
  }

  return (
    <nav className="navbar">
      <div className="nav-container">
        <Link href="/" className="nav-logo">
        JInstargram
        </Link>
        <div className="nav-links">
          {/* auth 상태가 null이면 아직 확인 중이므로 아무것도 표시하지 않음 */}
          {isLoggedIn === true ? (
            <>
              <Link href="/profile" className={styles.profileLink}>
                <span className={styles.profileText}>프로필</span>
                {profile && (
                  <div className={styles.profileAvatarWrapper}>
                    {profile.profileImageUrl ? (
                      <img 
                        src={profile.profileImageUrl} 
                        alt={profile.nickname || profile.username}
                        className={styles.profileAvatar}
                      />
                    ) : (
                      <div className={styles.profileAvatarPlaceholder}>
                        {(profile.nickname || profile.username)?.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <span className={styles.onlineIndicator} />
                  </div>
                )}
              </Link>
              <button 
                onClick={handleLogout}
                className="nav-button"
                type="button"
              >
                로그아웃
              </button>
            </>
          ) : isLoggedIn === false ? (
            <>
              <Link href="/login">로그인</Link>
              <Link href="/signup">회원가입</Link>
            </>
          ) : null}
        </div>
      </div>
    </nav>
  )
}

