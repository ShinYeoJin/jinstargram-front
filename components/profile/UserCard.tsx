import styles from './UserCard.module.css'

export interface User {
  id: string
  username: string
  nickname: string
  avatarUrl?: string
  bio?: string
  isFollowing?: boolean
}

interface UserCardProps {
  user: User
  onFollow?: (userId: string) => void
  onUnfollow?: (userId: string) => void
  onClick?: (userId: string) => void
}

export default function UserCard({
  user,
  onFollow,
  onUnfollow,
  onClick,
}: UserCardProps) {
  const handleFollowClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (user.isFollowing && onUnfollow) {
      onUnfollow(user.id)
    } else if (!user.isFollowing && onFollow) {
      onFollow(user.id)
    }
  }

  const handleCardClick = () => {
    if (onClick) {
      onClick(user.id)
    }
  }

  return (
    <div className={styles.card} onClick={handleCardClick}>
      <div className={styles.avatarContainer}>
        {user.avatarUrl ? (
          <img
            src={user.avatarUrl}
            alt={user.nickname}
            className={styles.avatar}
          />
        ) : (
          <div className={styles.avatarPlaceholder}>
            {user.nickname.charAt(0).toUpperCase()}
          </div>
        )}
      </div>
      <div className={styles.info}>
        <h3 className={styles.username}>{user.username}</h3>
        <p className={styles.nickname}>{user.nickname}</p>
        {user.bio && <p className={styles.bio}>{user.bio}</p>}
      </div>
      <button
        className={`${styles.followButton} ${
          user.isFollowing ? styles.following : styles.notFollowing
        }`}
        onClick={handleFollowClick}
        type="button"
      >
        {user.isFollowing ? '팔로잉' : '팔로우'}
      </button>
    </div>
  )
}

