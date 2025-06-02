// 리뷰 댓글(Reply) 관련 Supabase 쿼리 함수 모음
import { supabase } from './client';
import type { ReviewReply } from '@/types/database';

// 특정 리뷰의 댓글 목록 조회
export async function fetchRepliesByReviewId(reviewId: string) {
  const { data, error } = await supabase
    .from('review_replies')
    .select('*')
    .eq('review_id', reviewId)
    .order('created_at', { ascending: true });
  return { data: data as ReviewReply[] | null, error };
}

// 댓글 등록
export async function createReply(reviewId: string, content: string) {
  const { data, error } = await supabase
    .from('review_replies')
    .insert([{ review_id: reviewId, content }])
    .select()
    .single();
  return { data: data as ReviewReply | null, error };
}

// 댓글 삭제
export async function deleteReply(replyId: string) {
  const { error } = await supabase
    .from('review_replies')
    .delete()
    .eq('id', replyId);
  return { error };
} 