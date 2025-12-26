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
      // 쿠키 방식: API 호출로 인증 상태 확인 (쿠키는 자동으로 전송됨)
      try {
        const profileData = await getProfile(true) // silent 모드로 호출 (401 에러 조용히 처리)
        setProfile(profileData)
        setIsLoggedIn(true)
      } catch (error: any) {
        // 모든 에러를 조용히 처리 (401은 로그인하지 않은 상태, 정상)
        // 네트워크 에러나 기타 에러도 조용히 처리
        setProfile(null)
        setIsLoggedIn(false)
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
      // 이벤트 발생 시 약간의 지연 후 인증 상태 확인 (쿠키 설정 대기)
      setTimeout(() => {
        checkAuth()
      }, 200)
    }
    
    // 커스텀 이벤트 (로그인/로그아웃 시 발생)
    window.addEventListener('auth-change', handleAuthChange)

    return () => {
      window.removeEventListener('auth-change', handleAuthChange)
    }
  }, [pathname]) // pathname이 변경될 때마다 확인

  const handleLogout = async () => {
    try {
      await logout()
    } catch (error) {
      console.error('로그아웃 에러:', error)
    } finally {
      setIsLoggedIn(false)
      
      // 로그아웃 이벤트 발생
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('auth-change'))
      }
      
      router.push('/login')
      router.refresh() // 페이지 새로고침
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

