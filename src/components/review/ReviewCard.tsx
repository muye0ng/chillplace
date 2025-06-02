// 리뷰 카드 컴포넌트 (인스타그램/카카오 스타일 리디자인)
// Tailwind 스타일 강화, 한국어 주석 추가
import React from 'react';
import Image from 'next/image';
import ReplyForm from './ReplyForm';
import ReplyList from './ReplyList';
import { createReply } from '@/lib/supabase/replies';

export interface ReviewCardProps {
  review: {
    id: string;
    content: string; // 50자 제한
    author: string;
    timeAgo: string;
    helpfulCount: number;
    imageUrl?: string;
    rating?: number;
  };
  onHelpful: () => void;
  isHelpful?: boolean; // 내가 이미 도움돼요를 누른 경우
}

const ReviewCard: React.FC<ReviewCardProps> = ({ review, onHelpful, isHelpful }) => {
  const [showReplies, setShowReplies] = React.useState(false);
  const [replyRefreshKey, setReplyRefreshKey] = React.useState(0);

  // 댓글 등록 핸들러
  const handleReplySubmit = async (content: string) => {
    await createReply(review.id, content);
    setReplyRefreshKey(k => k + 1); // 댓글 목록 새로고침
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-none p-4 mb-5 flex flex-col gap-2 group transition hover:shadow-lg hover:-translate-y-1 animate-fade-in">
      {/* 리뷰 이미지 (비중 확대, 라운드/오버플로우) */}
      {review.imageUrl && (
        <div className="relative w-full h-44 rounded-xl overflow-hidden mb-2">
          <Image
            src={review.imageUrl}
            alt="리뷰 이미지"
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 768px) 100vw, 400px"
          />
        </div>
      )}
      {/* 상단: 작성자, 시간, 별점, 도움돼요 */}
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          <span className="font-bold text-sm text-gray-800">{review.author}</span>
          <span className="text-xs text-gray-400">{review.timeAgo}</span>
        </div>
        <div className="flex items-center gap-1">
          {[1,2,3,4,5].map(star => (
            <span key={star} className={`text-base ${star <= (review.rating || 0) ? 'text-yellow-400' : 'text-gray-200'}`}>★</span>
          ))}
          <span className="ml-1 text-xs text-gray-400">{review.rating || 0}점</span>
        </div>
      </div>
      {/* 리뷰 내용 */}
      <div className="text-base text-gray-900 font-medium leading-relaxed mb-2 whitespace-pre-line break-words">
        {review.content}
      </div>
      {/* 하단: 도움돼요/댓글 버튼 */}
      <div className="flex items-center gap-2 mt-1">
        <button
          className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold transition shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-200 active:scale-95
            ${isHelpful ? 'bg-blue-500 text-white animate-pulse' : 'bg-blue-50 hover:bg-blue-100 text-blue-600'}`}
          onClick={onHelpful}
          aria-pressed={isHelpful}
        >
          <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M7 10v12M17 10v12M2 10h20l-1.68-7.59A2 2 0 0 0 18.36 2H5.64a2 2 0 0 0-1.96 1.41L2 10zm5 0V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v6" />
          </svg>
          도움돼요 <span className="ml-1">({review.helpfulCount})</span>
        </button>
        <button
          className="flex items-center gap-1 px-3 py-1 rounded-full bg-gray-50 hover:bg-gray-100 text-gray-500 text-xs font-bold transition shadow-sm"
          onClick={() => setShowReplies(v => !v)}
          aria-expanded={showReplies}
        >
          💬 댓글
        </button>
      </div>
      {/* 댓글 영역 (토글) */}
      {showReplies && (
        <div className="mt-2 border-t pt-2">
          <ReplyForm onSubmit={handleReplySubmit} />
          <ReplyList key={replyRefreshKey} reviewId={review.id} />
        </div>
      )}
    </div>
  );
};

export default ReviewCard; 