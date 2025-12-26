// 프로필 관련 타입 정의

export interface Profile {
  id: string
  username: string
  email: string
  avatarUrl?: string
  bio?: string
  postCount: number
  followerCount: number
  followingCount: number
  createdAt: string
}

export interface Post {
  id: string
  userId: string
  imageUrl: string
  caption?: string
  likes: number
  comments: number
  createdAt: string
}

