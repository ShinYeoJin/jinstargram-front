import styles from './ProfileHeader.module.css'

interface ProfileHeaderProps {
  nickname: string
  username: string
  avatarUrl?: string
  bio?: string | null
  postCount?: number
  followerCount?: number
  followingCount?: number
  onEdit?: () => void
  onShare?: () => void
  isOnline?: boolean // 활동 중 표시
}

export default function ProfileHeader({
  nickname,
  username,
  avatarUrl,
  bio,
  postCount = 0,
  followerCount = 0,
  followingCount = 0,
  onEdit,
  onShare,
  isOnline = true, // 기본값: 로그인한 사용자는 활동 중
}: ProfileHeaderProps) {
  return (
    <div className={styles.header}>
      <div className={styles.avatarContainer}>
        <div className={`${styles.avatarWrapper} ${isOnline ? styles.online : ''}`}>
          {avatarUrl ? (
            <img src={avatarUrl} alt={nickname} className={styles.avatar} />
          ) : (
            <div className={styles.avatarPlaceholder}>
              {nickname.charAt(0).toUpperCase()}
            </div>
          )}
          {isOnline && <span className={styles.onlineIndicator} />}
        </div>
      </div>
      <div className={styles.info}>
        <h1 className={styles.nickname}>{nickname}</h1>
        {bio && <p className={styles.bio}>{bio}</p>}
        <div className={styles.buttonGroup}>
          {onEdit && (
            <button className={styles.editButton} onClick={onEdit} type="button">
              프로필 편집
            </button>
          )}
          {onShare && (
            <button className={styles.shareButton} onClick={onShare} type="button">
              프로필 공유
            </button>
          )}
        </div>
        <div className={styles.stats}>
          <div className={styles.statItem}>
            <span className={styles.statValue}>{postCount}</span>
            <span className={styles.statLabel}>게시물</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statValue}>{followerCount}</span>
            <span className={styles.statLabel}>팔로워</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statValue}>{followingCount}</span>
            <span className={styles.statLabel}>팔로잉</span>
          </div>
        </div>
      </div>
    </div>
  )
}

