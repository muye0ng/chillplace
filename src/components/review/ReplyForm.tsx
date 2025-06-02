// 댓글 입력 폼 컴포넌트 (미니멀/트렌디 리디자인)
// Tailwind 스타일 강화, 한국어 주석 추가
import React, { useState } from 'react';

export interface ReplyFormProps {
  onSubmit: (content: string) => void;
  charLimit?: number;
}

const ReplyForm: React.FC<ReplyFormProps> = ({ onSubmit, charLimit = 50 }) => {
  const [content, setContent] = useState('');
  return (
    <form
      className="flex gap-2 items-center mt-2 bg-gray-50 rounded-full px-2 py-1 border border-gray-100 shadow-none group"
      onSubmit={e => { e.preventDefault(); onSubmit(content); setContent(''); }}
    >
      {/* 댓글 입력창 (미니멀, 라운드) */}
      <input
        className="flex-1 border-none bg-transparent rounded-full px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 transition placeholder-gray-400"
        maxLength={charLimit}
        value={content}
        onChange={e => setContent(e.target.value)}
        placeholder="댓글을 입력하세요."
      />
      {/* 등록 버튼 (강조, 미니멀) */}
      <button
        type="submit"
        className="bg-gradient-to-tr from-blue-500 to-blue-400 hover:from-blue-600 hover:to-blue-500 text-white rounded-full px-4 py-1 text-sm font-bold transition active:scale-95 focus:outline-none focus:ring-2 focus:ring-blue-200"
      >
        등록
      </button>
    </form>
  );
};

export default ReplyForm; 