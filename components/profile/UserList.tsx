'use client'

import { useState, useEffect, useRef } from 'react'
import UserCard, { User } from './UserCard'
import { SCROLL_SPEED } from '@/lib/constants'
import styles from './UserList.module.css'

interface UserListProps {
  users: User[]
  title?: string
  onFollow?: (userId: string) => void
  onUnfollow?: (userId: string) => void
}

export default function UserList({ 
  users, 
  title = '추천 사용자',
  onFollow,
  onUnfollow,
}: UserListProps) {
  const [userList, setUserList] = useState<User[]>(users)
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [startX, setStartX] = useState(0)
  const [scrollLeft, setScrollLeft] = useState(0)

  // users prop이 변경되면 userList 업데이트
  useEffect(() => {
    setUserList(users)
  }, [users])

  const handleFollow = (userId: string) => {
    setUserList((prev) =>
      prev.map((user) =>
        user.id === userId ? { ...user, isFollowing: true } : user
      )
    )
    // 부모 컴포넌트의 콜백 호출
    if (onFollow) {
      onFollow(userId)
    }
    // Note: 현재는 로컬 상태만 업데이트
    // 향후 API 호출로 서버에 팔로우 상태 저장 예정
    console.log('팔로우:', userId)
  }

  const handleUnfollow = (userId: string) => {
    setUserList((prev) =>
      prev.map((user) =>
        user.id === userId ? { ...user, isFollowing: false } : user
      )
    )
    // 부모 컴포넌트의 콜백 호출
    if (onUnfollow) {
      onUnfollow(userId)
    }
    // Note: 현재는 로컬 상태만 업데이트
    // 향후 API 호출로 서버에 언팔로우 상태 저장 예정
    console.log('언팔로우:', userId)
  }

  const handleUserClick = (userId: string) => {
    // Note: 현재는 콘솔 로그만 출력
    // 향후 사용자 프로필 페이지로 이동하는 기능 구현 예정
    // 예: router.push(`/profile?user=${userId}`)
    console.log('사용자 클릭:', userId)
  }

  // 마우스 드래그 시작
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollContainerRef.current) return
    setIsDragging(true)
    setStartX(e.pageX - scrollContainerRef.current.offsetLeft)
    setScrollLeft(scrollContainerRef.current.scrollLeft)
  }

  // 마우스 드래그 중
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollContainerRef.current) return
    e.preventDefault()
    const x = e.pageX - scrollContainerRef.current.offsetLeft
    const walk = (x - startX) * SCROLL_SPEED.MULTIPLIER
    scrollContainerRef.current.scrollLeft = scrollLeft - walk
  }

  // 마우스 드래그 종료
  const handleMouseUp = () => {
    setIsDragging(false)
  }

  // 마우스가 영역을 벗어날 때
  const handleMouseLeave = () => {
    setIsDragging(false)
  }

  // 터치 시작
  const handleTouchStart = (e: React.TouchEvent) => {
    if (!scrollContainerRef.current) return
    setIsDragging(true)
    setStartX(e.touches[0].pageX - scrollContainerRef.current.offsetLeft)
    setScrollLeft(scrollContainerRef.current.scrollLeft)
  }

  // 터치 이동
  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || !scrollContainerRef.current) return
    e.preventDefault() // 기본 스크롤 동작 방지
    const x = e.touches[0].pageX - scrollContainerRef.current.offsetLeft
    const walk = (x - startX) * SCROLL_SPEED.MULTIPLIER
    scrollContainerRef.current.scrollLeft = scrollLeft - walk
  }

  // 터치 종료
  const handleTouchEnd = () => {
    setIsDragging(false)
  }

  if (userList.length === 0) {
    return null
  }

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>{title}</h2>
      <div 
        ref={scrollContainerRef}
        className={`${styles.list} ${isDragging ? styles.dragging : ''}`}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {userList.map((user) => (
          <UserCard
            key={user.id}
            user={user}
            onFollow={handleFollow}
            onUnfollow={handleUnfollow}
            onClick={handleUserClick}
          />
        ))}
      </div>
    </div>
  )
}

