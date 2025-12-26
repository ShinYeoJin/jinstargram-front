'use client'

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { logout, getProfile } from '@/services/auth'
import type { ProfileResponse } from '@/types/auth'
import styles from './Navbar.module.css'

export default function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [profile, setProfile] = useState<ProfileResponse | null>(null)
  const router = useRouter()
  const pathname = usePathname()

  // 로그인 상태 확인 및 프로필 데이터 가져오기
  useEffect(() => {
    const checkAuth = async () => {
      // localStorage에서 로그인 플래그 확인 (즉시 업데이트를 위해)
      const loginFlag = typeof window !== 'undefined' ? localStorage.getItem('isLoggedIn') : null
      const wasLoggedIn = loginFlag === 'true'

      // 쿠키 방식: API 호출로 인증 상태 확인 (쿠키는 자동으로 전송됨)
      try {
        const profileData = await getProfile(true) // silent 모드로 호출 (401 에러 조용히 처리)
        setProfile(profileData)
        setIsLoggedIn(true)
        // 로그인 성공 시 플래그 저장
        if (typeof window !== 'undefined') {
          localStorage.setItem('isLoggedIn', 'true')
        }
      } catch (error: any) {
        // localStorage 플래그가 있으면 로그인 상태 유지 (쿠키 설정 지연 대응)
        if (wasLoggedIn) {
          // 플래그가 있으면 로그인 상태 유지 (API 호출 실패해도)
          setIsLoggedIn(true)
          // 프로필은 나중에 다시 시도할 수 있도록 null 유지
        } else {
          // 플래그가 없으면 로그아웃 상태
          setProfile(null)
          setIsLoggedIn(false)
          // 로그아웃 시 플래그 제거
          if (typeof window !== 'undefined') {
            localStorage.removeItem('isLoggedIn')
          }
        }
        // 조용한 에러가 아닌 경우에만 콘솔에 출력 (실제 에러만)
        if (!error?.isSilent && error?.statusCode !== 401 && error?.response?.status !== 401) {
          // 실제 에러만 콘솔에 출력 (401은 정상)
        }
      }
    }

    // 초기 인증 상태 확인
    checkAuth()

    // 인증 상태 변경 감지를 위한 이벤트 리스너
    const handleAuthChange = () => {
      // 이벤트 발생 시 즉시 확인
      checkAuth()
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
  }, [pathname]) // pathname이 변경될 때마다 확인 (페이지 이동 시 자동으로 상태 확인)

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
          {isLoggedIn ? (
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
          ) : (
            <>
              <Link href="/login">로그인</Link>
              <Link href="/signup">회원가입</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}

