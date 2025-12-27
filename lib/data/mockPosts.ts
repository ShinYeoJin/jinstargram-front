/**
 * 프로필 페이지에서 사용하는 Mock 게시글 데이터
 * 추후 실제 API로 대체 예정
 */
export interface Post {
  id: string
  imageUrl: string
  caption: string
  likes: number
  comments: number
  createdAt: string
}

export const mockPosts: Post[] = [
  {
    id: '1',
    imageUrl: 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=500&h=500&fit=crop',
    caption: '햅삐 골댕스!',
    likes: 42,
    comments: 8,
    createdAt: '2024-01-15T10:30:00Z',
  },
  {
    id: '2',
    imageUrl: 'https://images.unsplash.com/photo-1517849845537-4d257902454a?w=500&h=500&fit=crop',
    caption: '🎄 퍼그퍽으퍼그 🎄',
    likes: 67,
    comments: 12,
    createdAt: '2024-01-14T14:20:00Z',
  },
  {
    id: '3',
    imageUrl: 'https://images.unsplash.com/photo-1505628346881-b72b27e84530?w=500&h=500&fit=crop',
    caption: '멋쟁이 강쥐스 😎',
    likes: 89,
    comments: 15,
    createdAt: '2024-01-13T16:45:00Z',
  },
]

