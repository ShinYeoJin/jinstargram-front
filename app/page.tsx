'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { getProfile } from '@/services/auth'
import type { ProfileResponse } from '@/types/auth'
import styles from './page.module.css'

export default function Home() {
  const [profile, setProfile] = useState<ProfileResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await getProfile(true) // silent 모드로 호출 (401 에러 조용히 처리)
        setProfile(data)
      } catch (error) {
        // 로그인하지 않은 상태는 정상
        setProfile(null)
      } finally {
        setIsLoading(false)
      }
    }

    fetchProfile()

    // auth-change 이벤트 리스너
    const handleAuthChange = () => {
      fetchProfile()
    }
    window.addEventListener('auth-change', handleAuthChange)

    return () => {
      window.removeEventListener('auth-change', handleAuthChange)
    }
  }, [])

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

