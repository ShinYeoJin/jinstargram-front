import styles from './PostCard.module.css'
import { DATE_FORMAT } from '@/lib/constants'

/**
 * 게시글 데이터 인터페이스
 */
export interface Post {
  id: string
  imageUrl: string
  caption: string
  likes: number
  comments: number
  createdAt: string
}

interface PostCardProps {
  post: Post
  onClick?: (postId: string) => void
}

/**
 * 게시글 카드 컴포넌트
 * 게시글 이미지, 좋아요 수, 댓글 수, 캡션을 표시합니다.
 */
export default function PostCard({ post, onClick }: PostCardProps) {
  const handleClick = () => {
    if (onClick) {
      onClick(post.id)
    }
  }

  /**
   * 날짜를 상대적 시간 형식으로 포맷팅
   * @param dateString - ISO 형식의 날짜 문자열
   * @returns 포맷팅된 날짜 문자열 (예: "5분 전", "2일 전")
   */
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const days = Math.floor(diff / DATE_FORMAT.MILLISECONDS_PER_DAY)
    
    if (days === 0) {
      const hours = Math.floor(diff / DATE_FORMAT.MILLISECONDS_PER_HOUR)
      if (hours === 0) {
        const minutes = Math.floor(diff / DATE_FORMAT.MILLISECONDS_PER_MINUTE)
        return `${minutes}분 전`
      }
      return `${hours}시간 전`
    } else if (days < DATE_FORMAT.DAYS_IN_WEEK) {
      return `${days}일 전`
    } else {
      return date.toLocaleDateString(DATE_FORMAT.LOCALE, { month: 'short', day: 'numeric' })
    }
  }

  return (
    <div className={styles.card} onClick={handleClick}>
      <div className={styles.imageContainer}>
        <img src={post.imageUrl} alt={post.caption} className={styles.image} />
        <div className={styles.overlay}>
          <div className={styles.stats}>
            <span className={styles.statItem}>❤️ {post.likes}</span>
            <span className={styles.statItem}>💬 {post.comments}</span>
          </div>
        </div>
      </div>
      <div className={styles.content}>
        <p className={styles.caption}>{post.caption}</p>
        <span className={styles.date}>{formatDate(post.createdAt)}</span>
      </div>
    </div>
  )
}

