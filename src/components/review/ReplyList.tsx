// 댓글 목록(ReplyList) 컴포넌트입니다.
import React, { useEffect, useState } from 'react';
import { fetchRepliesByReviewId, deleteReply } from '@/lib/supabase/replies';
import type { ReviewReply } from '@/types/database';

export interface ReplyListProps {
  reviewId: string;
}

const ReplyList: React.FC<ReplyListProps> = ({ reviewId }) => {
  const [replies, setReplies] = useState<ReviewReply[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    fetchRepliesByReviewId(reviewId).then(({ data, error }) => {
      if (error) setError(error.message);
      if (data) setReplies(data);
      setLoading(false);
    });
  }, [reviewId]);

  const handleDelete = async (replyId: string) => {
    await deleteReply(replyId);
    setReplies(replies => replies.filter(r => r.id !== replyId));
  };

  if (loading) return <div className="text-xs text-gray-400 py-2">댓글 로딩 중...</div>;
  if (error) return <div className="text-xs text-red-400 py-2">댓글 에러: {error}</div>;
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