'use client'

import PostCard, { Post } from './PostCard'
import styles from './PostList.module.css'

interface PostListProps {
  posts: Post[]
  title?: string
  onPostClick?: (postId: string) => void
}

export default function PostList({
  posts,
  title = '게시글',
  onPostClick,
}: PostListProps) {
  if (posts.length === 0) {
    return (
      <div className={styles.container}>
        <h2 className={styles.title}>{title}</h2>
        <div className={styles.empty}>
          <p>아직 게시글이 없습니다.</p>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>{title}</h2>
      <div className={styles.grid}>
        {posts.map((post) => (
          <PostCard key={post.id} post={post} onClick={onPostClick} />
        ))}
      </div>
    </div>
  )
}

