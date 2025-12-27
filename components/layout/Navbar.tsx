'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuthContext } from '@/contexts/AuthContext'
import styles from './Navbar.module.css'

export default function Navbar() {
  const { isLoggedIn, profile, handleLogout } = useAuthContext()
  const router = useRouter()

  const onLogout = async () => {
    await handleLogout()
    router.push('/login')
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

