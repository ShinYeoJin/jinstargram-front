'use client'

import Link from 'next/link'
import { useAuthContext } from '@/contexts/AuthContext'
import styles from './page.module.css'

export default function Home() {
  // AuthContext에서 단일 인증 상태 사용
  const { isLoggedIn, profile } = useAuthContext()
  
  // isLoggedIn === null: 확인 중
  const isLoading = isLoggedIn === null

  return (
    <main className={styles.container}>
      <h1 className={styles.title}>JInstargram</h1>
      {isLoading ? (
        <p className={styles.welcome}>로딩 중...</p>
      ) : profile ? (
        <div className={styles.welcomeSection}>
          <p className={styles.welcome}>
            💛 환영합니다, {profile.nickname || profile.username}님! 💛
          </p>
          <Link href="/profile" className={styles.profileLink}>
            프로필 보기 →
          </Link>
        </div>
      ) : (
        <div className={styles.welcomeSection}>
          <p className={styles.welcome}>💛 Welcome to JInstargram 💛</p>
          <div className={styles.authLinks}>
            <Link href="/login" className={styles.link}>로그인</Link>
            <span className={styles.separator}>|</span>
            <Link href="/signup" className={styles.link}>회원가입</Link>
          </div>
        </div>
      )}
    </main>
  )
}

