// 블라인드식 광고 모달 컴포넌트입니다.
// 광고 정보, 닫기/숨기기 기능 제공
import React from 'react';

export interface AdModalProps {
  ad: {
    title: string;
    content: string;
    imageUrl: string;
    targetUrl: string;
  };
  onClose: () => void;
  onHideFor: (duration: '1hour' | '1day' | 'never') => void;
}

const AdModal: React.FC<AdModalProps> = ({ ad, onClose, onHideFor }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-lg p-6 w-80 relative flex flex-col items-center">
        <button className="absolute top-2 right-2 text-gray-400" onClick={onClose} aria-label="닫기">✕</button>
        <img src={ad.imageUrl} alt={ad.title} className="w-full h-32 object-cover rounded mb-3" />
        <h2 className="text-lg font-bold mb-1">{ad.title}</h2>
        <p className="text-sm text-gray-700 mb-3">{ad.content}</p>
        <a href={ad.targetUrl} target="_blank" rel="noopener noreferrer" className="bg-blue-500 text-white rounded px-4 py-2 mb-2">자세히 보기</a>
        <div className="flex gap-2 text-xs text-gray-500">
          <button onClick={() => onHideFor('1hour')}>1시간 숨기기</button>
          <button onClick={() => onHideFor('1day')}>오늘 하루 숨기기</button>
          <button onClick={() => onHideFor('never')}>다시 보지 않기</button>
        </div>
      </div>
    </div>
  );
};

export default AdModal; 