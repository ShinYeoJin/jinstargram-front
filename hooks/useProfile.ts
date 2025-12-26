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

  // 프로필 데이터 로드 (auth와 분리)
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setIsLoading(true);
        setError(null); // 에러 초기화
        
        // 쿠키 기반 인증: getProfile 호출 (쿠키는 자동으로 전송됨)
        // profile fetch 실패는 auth 실패와 분리하여 처리
        const data = await getProfile(true); // silent=true: 401은 조용히 처리
        setProfile(data);
        setError(null);
        
        // 로그인 성공 시 플래그 저장 (다음 렌더링 시 힌트로 사용)
        if (typeof window !== 'undefined') {
          localStorage.setItem('isLoggedIn', 'true')
        }
      } catch (err: unknown) {
        // profile fetch 실패를 auth 실패로 처리하지 않음
        // AuthGuard가 이미 인증을 확인했으므로, 여기서는 profile 데이터만 처리
        const errorResponse = err as any;
        
        // 401 에러는 인증 실패이므로 AuthGuard가 처리 (여기서는 조용히 처리)
        if (errorResponse?.response?.status === 401 || errorResponse?.statusCode === 401) {
          // 인증 실패는 AuthGuard가 처리하므로 여기서는 에러 표시하지 않음
          setError(null);
          setProfile(null);
          setIsLoading(false);
        } else {
          // 네트워크 에러 등 다른 에러는 profile fetch 실패로 처리
          // 재시도 로직 추가 (auth와 분리)
          console.error('프로필 조회 에러:', err);
          setError(null); // 에러 메시지 표시하지 않음
          setProfile(null);
          
          // 재시도 (쿠키 설정 지연 대응)
          let retryCount = 0;
          const maxRetries = 3;
          const retryDelay = 1000; // 1초
          
          const retryFetch = async () => {
            if (retryCount >= maxRetries) {
              setIsLoading(false);
              return;
            }
            
            retryCount++;
            await new Promise(resolve => setTimeout(resolve, retryDelay));
            
            try {
              const data = await getProfile(true);
              setProfile(data);
              setError(null);
              setIsLoading(false);
            } catch (retryErr) {
              // 재시도 실패 시 다시 시도
              retryFetch();
            }
          };
          
          retryFetch();
        }
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

