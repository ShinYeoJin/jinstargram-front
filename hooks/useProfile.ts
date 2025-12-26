/**
 * 프로필 페이지 전용 커스텀 훅
 */

import { useState, useEffect, useCallback } from 'react';
import { getProfile, updateProfile } from '@/services/auth';
import { handleShareProfile } from '@/lib/utils/share';
import type { ProfileResponse } from '@/types/auth';
import { User } from '@/components/profile/UserCard';
import { mockUsers } from '@/lib/data/mockUsers';

interface UseProfileReturn {
  profile: ProfileResponse | null;
  isLoading: boolean;
  error: string | null;
  followingCount: number;
  followerCount: number;
  userList: User[];
  isEditModalOpen: boolean;
  setIsEditModalOpen: (open: boolean) => void;
  handleEdit: () => void;
  handleShare: () => Promise<void>;
  handleSaveProfile: (data: {
    nickname: string;
    bio?: string | null;
    profileImageUrl?: string | null;
  }) => Promise<void>;
  handleFollow: (userId: string) => void;
  handleUnfollow: (userId: string) => void;
}

export function useProfile(
  onShareSuccess?: (message: string) => void,
  onShareError?: (message: string) => void
): UseProfileReturn {
  const [profile, setProfile] = useState<ProfileResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [followingCount, setFollowingCount] = useState<number>(0);
  const [followerCount, setFollowerCount] = useState<number>(0);
  const [userList, setUserList] = useState<User[]>(mockUsers);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // 초기 팔로잉 수 계산
  useEffect(() => {
    const initialFollowingCount = mockUsers.filter(user => user.isFollowing).length;
    setFollowingCount(initialFollowingCount);
  }, []);

  // 프로필 데이터 로드
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setIsLoading(true);
        setError(null); // 에러 초기화
        
        // localStorage에서 로그인 플래그 확인 (Navbar와 동일한 방식)
        const loginFlag = typeof window !== 'undefined' ? localStorage.getItem('isLoggedIn') : null
        const wasLoggedIn = loginFlag === 'true'
        
        // 쿠키 기반 인증: getProfile 호출 (쿠키는 자동으로 전송됨)
        const data = await getProfile(true); // silent=true: localStorage 플래그가 있으면 에러 무시
        setProfile(data);
        
        // 로그인 성공 시 플래그 저장
        if (typeof window !== 'undefined') {
          localStorage.setItem('isLoggedIn', 'true')
        }
      } catch (err: unknown) {
        // localStorage 플래그 확인
        const loginFlag = typeof window !== 'undefined' ? localStorage.getItem('isLoggedIn') : null
        const wasLoggedIn = loginFlag === 'true'
        
        // 플래그가 있으면 쿠키 설정 지연으로 인한 일시적 에러로 간주
        if (wasLoggedIn) {
          // 플래그가 있으면 에러를 표시하지 않고 나중에 다시 시도
          // 프로필은 null로 유지하되 에러 메시지는 표시하지 않음
          setError(null);
          // 잠시 후 다시 시도 (쿠키 설정 대기)
          setTimeout(() => {
            const retryFetch = async () => {
              try {
                const data = await getProfile(true);
                setProfile(data);
                setError(null);
              } catch (retryErr) {
                // 재시도 실패해도 플래그가 있으면 에러 표시하지 않음
                console.error('프로필 재시도 에러:', retryErr);
              }
            };
            retryFetch();
          }, 1000);
        } else {
          // 플래그가 없으면 실제 에러로 처리
          console.error('프로필 조회 에러:', err);
          const errorResponse = err as any;
          let errorMessage = '프로필을 불러오는데 실패했습니다.';
          
          // 에러 메시지 추출
          if (errorResponse?.message) {
            errorMessage = errorResponse.message;
          } else if (errorResponse?.response?.data?.message) {
            errorMessage = Array.isArray(errorResponse.response.data.message)
              ? errorResponse.response.data.message.join(', ')
              : errorResponse.response.data.message;
          } else if (err instanceof Error) {
            errorMessage = err.message;
          }
          
          setError(errorMessage);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleEdit = useCallback(() => {
    setIsEditModalOpen(true);
  }, []);

  const handleShare = useCallback(async () => {
    if (!profile) return;

    const result = await handleShareProfile(
      profile.username,
      profile.nickname || profile.username
    );

    if (result.success) {
      onShareSuccess?.(result.message);
    } else {
      onShareError?.(result.message);
    }
  }, [profile, onShareSuccess, onShareError]);

  const handleSaveProfile = useCallback(async (data: {
    nickname: string;
    bio?: string | null;
    profileImageUrl?: string | null;
  }) => {
    try {
      const updatedProfile = await updateProfile({
        nickname: data.nickname,
        bio: data.bio,
        profileImageUrl: data.profileImageUrl,
      });

      setProfile(updatedProfile);
      setIsEditModalOpen(false);
      
      // 프로필 정보 다시 불러오기 (최신 정보 보장)
      const freshProfile = await getProfile();
      setProfile(freshProfile);
    } catch (err: unknown) {
      console.error('프로필 업데이트 에러:', err);
      throw err instanceof Error ? err : new Error('프로필 업데이트에 실패했습니다.');
    }
  }, []);

  const handleFollow = useCallback((userId: string) => {
    setUserList((prev) =>
      prev.map((user) =>
        user.id === userId ? { ...user, isFollowing: true } : user
      )
    );
    setFollowingCount((prev) => prev + 1);
  }, []);

  const handleUnfollow = useCallback((userId: string) => {
    setUserList((prev) =>
      prev.map((user) =>
        user.id === userId ? { ...user, isFollowing: false } : user
      )
    );
    setFollowingCount((prev) => Math.max(0, prev - 1));
  }, []);

  return {
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
  };
}

