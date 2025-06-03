// 댓글 목록(ReplyList) 컴포넌트입니다.
import React from 'react';
import useSWR from 'swr';
import { fetchRepliesByReviewId, deleteReply } from '@/lib/supabase/replies';
// import type { ReviewReply } from '@/types/database'; // 사용하지 않으므로 주석 처리 또는 삭제

export interface ReplyListProps {
  reviewId: string;
}

const fetcher = async (reviewId: string) => {
  const { data, error } = await fetchRepliesByReviewId(reviewId);
  if (error) throw error;
  return data ?? [];
};

const ReplyList: React.FC<ReplyListProps> = ({ reviewId }) => {
  // SWR로 댓글 목록 관리
  const { data: replies = [], error, isLoading, mutate } = useSWR(['replies', reviewId], () => fetcher(reviewId));

  // 댓글 삭제 핸들러
  const handleDelete = async (replyId: string) => {
    await deleteReply(replyId);
    mutate(); // SWR 데이터 즉시 갱신
  };

  if (isLoading) return <div className="text-xs text-gray-400 py-2">댓글 로딩 중...</div>;
  if (error) return <div className="text-xs text-red-400 py-2">댓글 에러: {error.message || error.toString()}</div>;
  if (replies.length === 0) return <div className="text-xs text-gray-300 py-2">아직 댓글이 없습니다.</div>;

  return (
    <ul className="flex flex-col gap-2 mt-2">
      {replies.map(reply => (
        <li key={reply.id} className="bg-gray-50 rounded-lg px-3 py-2 flex items-center justify-between text-sm shadow-sm">
          <span className="text-gray-700">{reply.content}</span>
          <button className="text-xs text-red-400 hover:text-red-600 ml-2" onClick={() => handleDelete(reply.id)}>삭제</button>
        </li>
      ))}
    </ul>
  );
};

export default ReplyList; 