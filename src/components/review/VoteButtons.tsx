// Like/No 투표 버튼 컴포넌트입니다.
// 장소 카드, 리뷰 등에서 사용됩니다.
import React from 'react';

export interface VoteButtonsProps {
  onVote: (type: 'like' | 'no') => void;
  userVote?: 'like' | 'no';
}

const VoteButtons: React.FC<VoteButtonsProps> = ({ onVote, userVote }) => {
  return (
    <div className="flex gap-2 mt-2">
      <button
        className={`px-4 py-2 rounded ${userVote === 'like' ? 'bg-blue-500 text-white' : 'bg-gray-100'}`}
        onClick={() => onVote('like')}
      >
        좋아요
      </button>
      <button
        className={`px-4 py-2 rounded ${userVote === 'no' ? 'bg-red-500 text-white' : 'bg-gray-100'}`}
        onClick={() => onVote('no')}
      >
        별로예요
      </button>
    </div>
  );
};

export default VoteButtons; 