import { User } from '@/components/profile/UserCard'

/**
 * 프로필 페이지에서 사용하는 Mock 사용자 데이터
 * 추후 실제 API로 대체 예정
 */
export const mockUsers: User[] = [
  {
    id: '1',
    username: 'user1',
    nickname: '김철수',
    bio: '안녕하세요! 개발자입니다.',
    avatarUrl: undefined,
    isFollowing: false,
  },
  {
    id: '2',
    username: 'user2',
    nickname: '이영희',
    bio: '사진을 좋아하는 사람입니다 📸',
    avatarUrl: undefined,
    isFollowing: true,
  },
  {
    id: '3',
    username: 'user3',
    nickname: '박민수',
    bio: '여행과 음악을 사랑합니다',
    avatarUrl: undefined,
    isFollowing: false,
  },
  {
    id: '4',
    username: 'user4',
    nickname: '정수진',
    bio: '일상의 소중한 순간들을 기록합니다',
    avatarUrl: undefined,
    isFollowing: true,
  },
  {
    id: '5',
    username: 'user5',
    nickname: '최동욱',
    bio: '맛집 탐방 중 🍕',
    avatarUrl: undefined,
    isFollowing: false,
  },
]

