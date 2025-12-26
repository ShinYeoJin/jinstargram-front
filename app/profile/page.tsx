'use client'

import { useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import AuthGuard from '@/components/auth/AuthGuard'
import ProfileHeader from '@/components/profile/ProfileHeader'
import UserList from '@/components/profile/UserList'
import PostList from '@/components/profile/PostList'
import ProfileEditModal from '@/components/profile/ProfileEditModal'
import { ToastContainer, useToast } from '@/components/ui/ToastContainer'
import { useProfile } from '@/hooks/useProfile'
import { mockPosts } from '@/lib/data/mockPosts'
import styles from './profile.module.css'

export default function ProfilePage() {
  const { showToast, removeToast, toasts } = useToast()
  const searchParams = useSearchParams()
  const {
    profile,
    isLoading,
    error,
    followingCount,
    followerCount,
    userList,
    isEditModalOpen,
    setIsEditModalOpen,
    handleEdit,
    handleShare,
    handleSaveProfile,
    handleFollow,
    handleUnfollow,
  } = useProfile(
    (message) => showToast(message, 'success'),
    (message) => showToast(message, 'error')
  )

  // 로그인 후 리다이렉트된 경우 성공 메시지 표시
  useEffect(() => {
    if (searchParams.get('login') === 'success') {
      showToast('로그인되었습니다.', 'success')
      // URL에서 파라미터 제거
      window.history.replaceState({}, '', '/profile')
    }
  }, [searchParams, showToast])

  if (isLoading) {
    return (
      <AuthGuard>
        <div className={styles.container}>
          <div className={styles.content}>
            <div style={{ textAlign: 'center', padding: '2rem' }}>
              <p>로딩 중...</p>
            </div>
          </div>
        </div>
      </AuthGuard>
    )
  }

  if (error || !profile) {
    return (
      <AuthGuard>
        <div className={styles.container}>
          <div className={styles.content}>
            <div style={{ textAlign: 'center', padding: '2rem' }}>
              <p style={{ color: 'red' }}>{error || '프로필을 불러올 수 없습니다.'}</p>
            </div>
          </div>
        </div>
      </AuthGuard>
    )
  }

  return (
    <AuthGuard>
      <div className={styles.container}>
        <div className={styles.content}>
          {/* 프로필 헤더 */}
          <ProfileHeader
            nickname={profile.nickname || profile.username}
            username={profile.username}
            avatarUrl={profile.profileImageUrl || undefined}
            bio={profile.bio}
            postCount={mockPosts.length}
            followerCount={followerCount}
            followingCount={followingCount}
            onEdit={handleEdit}
            onShare={handleShare}
            isOnline={true} // 로그인한 사용자는 활동 중
          />

          {/* 다른 사용자 목록 */}
          <UserList 
            users={userList} 
            title="추천 사용자"
            onFollow={handleFollow}
            onUnfollow={handleUnfollow}
          />

          {/* 게시글 목록 */}
          <PostList 
            posts={mockPosts}
            title="게시글"
          />
        </div>

        {/* 프로필 편집 모달 */}
        {profile && (
          <ProfileEditModal
            isOpen={isEditModalOpen}
            onClose={() => setIsEditModalOpen(false)}
            currentNickname={profile.nickname || profile.username}
            currentBio={profile.bio}
            currentAvatarUrl={profile.profileImageUrl || undefined}
            onSave={handleSaveProfile}
          />
        )}

        {/* 토스트 메시지 */}
        <ToastContainer toasts={toasts} onRemove={removeToast} />
      </div>
    </AuthGuard>
  )
}
