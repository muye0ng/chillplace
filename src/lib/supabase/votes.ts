// 투표 관련 Supabase 함수 모음입니다.
// Like/No 투표 등록, 조회 등 함수 뼈대 제공
import { supabase } from './client';
import { addFavorite, removeFavorite } from './favorites';

// 투표 등록 (좋아요 시 자동 즐겨찾기 추가)
export async function votePlace(placeId: string, voteType: 'like' | 'no') {
  // 먼저 기존 투표 확인
  const { data: existingVote } = await supabase
    .from('votes')
    .select('vote_type')
    .eq('place_id', placeId)
    .single();
  
  // 투표 등록/업데이트
  const { data, error } = await supabase
    .from('votes')
    .upsert([{ place_id: placeId, vote_type: voteType }], { 
      onConflict: 'user_id,place_id' 
    });
  
  if (error) return { data, error };
  
  // 좋아요 투표 시 자동으로 즐겨찾기 추가
  if (voteType === 'like') {
    await addFavorite(placeId);
  } 
  // 기존이 좋아요였는데 싫어요로 변경하면 즐겨찾기 해제
  else if (voteType === 'no' && existingVote?.vote_type === 'like') {
    await removeFavorite(placeId);
  }
  
  return { data, error };
}

// 내 투표 조회
export async function getUserVote(placeId: string, userId: string) {
  return supabase.from('votes').select('*').eq('place_id', placeId).eq('user_id', userId).single();
}

// 투표수 집계 결과 타입
export interface VoteCount {
  place_id: string;
  vote_type: 'like' | 'no';
  count: number;
}

// 여러 장소의 투표수를 한 번에 집계하는 함수
export async function fetchVoteCountsByPlaceIds(placeIds: string[]) {
  // Supabase에서 group by place_id, vote_type으로 집계
  const { data, error } = await supabase
    .from('votes')
    .select('place_id, vote_type')
    .in('place_id', placeIds);
  // JS에서 집계 처리
  const counts: Record<string, { like: number; no: number }> = {};
  if (Array.isArray(data)) {
    data.forEach((row: { place_id: string; vote_type: 'like' | 'no' }) => {
      if (!counts[row.place_id]) counts[row.place_id] = { like: 0, no: 0 };
      if (row.vote_type === 'like') counts[row.place_id].like += 1;
      if (row.vote_type === 'no') counts[row.place_id].no += 1;
    });
  }
  // 결과를 VoteCount[] 형태로 맞춰 반환
  const result: VoteCount[] = [];
  Object.entries(counts).forEach(([place_id, { like, no }]) => {
    result.push({ place_id, vote_type: 'like', count: like });
    result.push({ place_id, vote_type: 'no', count: no });
  });
  return { data: result, error };
} 