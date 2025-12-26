'use client'

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { useAuthContext } from '@/contexts/AuthContext'
import styles from './Navbar.module.css'

export default function Navbar() {
  // AuthContext에서 단일 auth 상태 소비 (state 생성하지 않음)
  const { isLoggedIn, profile, handleLogout } = useAuthContext()
  const router = useRouter()
  const pathname = usePathname()

  // Context 인스턴스 ID 확인 (런타임 증명용)
  useEffect(() => {
    const ctxId = typeof window !== 'undefined' ? (window as any).__AUTH_CTX_ID : 'N/A'
    console.log('[Navbar] auth', isLoggedIn, ctxId)
  }, [isLoggedIn])

  const onLogout = async () => {
    await handleLogout()
    // 로그아웃 이벤트 발생 (다른 컴포넌트도 업데이트되도록)
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('auth-change'))
    }
    // 로그인 페이지로 리다이렉트
    router.push('/login')
    router.refresh()
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
                onClick={onLogout}
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

