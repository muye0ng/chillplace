// 30초 리뷰 작성 폼 컴포넌트 (인스타그램/카카오 스타일 리디자인)
// Tailwind 스타일 강화, 한국어 주석 추가
import React, { useState } from 'react';

export interface ReviewFormProps {
  placeId: string;
  onSubmit: (content: string, rating: number, image?: File) => void;
  timeLimit: number; // 30초
  charLimit: number; // 50자
}

const ReviewForm: React.FC<ReviewFormProps> = ({ onSubmit, timeLimit, charLimit }) => {
  // 입력 상태 및 타이머 상태 관리
  const [content, setContent] = useState('');
  const [image, setImage] = useState<File | undefined>();
  const [rating, setRating] = useState(5); // 기본 5점
  // TODO: 타이머 구현 및 제출/제한 로직 추가

  return (
    <form
      className="flex flex-col gap-4 p-4 bg-white rounded-2xl border border-gray-100 shadow-none animate-fade-in group"
      onSubmit={e => { e.preventDefault(); onSubmit(content, rating, image); }}
    >
      {/* 별점 입력 (미니멀/트렌디) */}
      <div className="flex items-center gap-1 mb-1">
        {[1,2,3,4,5].map(star => (
          <button
            type="button"
            key={star}
            className={`text-2xl transition-all duration-150 ${star <= rating ? 'text-yellow-400 scale-110' : 'text-gray-300'} hover:scale-125`}
            onClick={() => setRating(star)}
            aria-label={`${star}점`}
          >
            ★
          </button>
        ))}
        <span className="ml-2 text-xs text-gray-400 font-mono">{rating}점</span>
      </div>
      {/* 리뷰 입력창 */}
      <textarea
        className="border border-gray-200 rounded-lg p-3 resize-none focus:outline-none focus:ring-2 focus:ring-blue-200 text-base text-gray-900 placeholder-gray-400 transition bg-gray-50 group-hover:bg-blue-50"
        maxLength={charLimit}
        value={content}
        onChange={e => setContent(e.target.value)}
        placeholder="30초 안에 50자 이내로 리뷰를 작성해 주세요."
        rows={3}
      />
      {/* 글자수/타이머 안내 */}
      <div className="flex justify-between items-center text-xs text-gray-400">
        <span>{content.length} / {charLimit}자</span>
        <span className="font-mono bg-gray-100 rounded px-2 py-0.5">남은 시간: {timeLimit}s</span>
      </div>
      {/* 이미지 첨부 */}
      <label className="flex items-center gap-2 cursor-pointer text-blue-500 hover:text-blue-700 transition">
        <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M4 16v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
        <span>이미지 첨부</span>
        <input type="file" accept="image/*" onChange={e => setImage(e.target.files?.[0])} className="hidden" />
        {image && <span className="text-xs text-gray-500 ml-2">{image.name}</span>}
      </label>
      {/* 등록 버튼 (강조, 미니멀) */}
      <button
        type="submit"
        className="bg-gradient-to-tr from-blue-500 to-blue-400 hover:from-blue-600 hover:to-blue-500 text-white rounded-full py-2 mt-2 font-bold shadow-md transition active:scale-95 focus:outline-none focus:ring-2 focus:ring-blue-200"
      >
        리뷰 등록
      </button>
    </form>
  );
};

export default ReviewForm; 