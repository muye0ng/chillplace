// 장소 카드 컴포넌트(인스타그램 스타일 리디자인)
// 이미지 위 오버레이, 미니멀/트렌디 UI, 한국어 주석 강화
import React from 'react';
import Image from 'next/image';

export interface PlaceCardProps {
  place: {
    id: string;
    name: string;
    category: string;
    imageUrl: string;
    likeCount: number;
    noCount: number;
    distance: string;
  };
  onVote: (type: 'like' | 'no') => void;
  userVote?: 'like' | 'no';
  isFavorite?: boolean; // 즐겨찾기 여부
  onClick?: () => void; // 카드 클릭 시 핸들러(상세 이동)
}

const PlaceCard: React.FC<PlaceCardProps> = ({ place, onVote, userVote, isFavorite, onClick }) => {
  return (
    <div
      className="bg-white rounded-2xl shadow-none border border-gray-100 mb-5 overflow-hidden relative cursor-pointer group transition hover:shadow-xl hover:-translate-y-1"
      onClick={onClick}
    >
      {/* 장소 이미지 (비중 확대, 라운드/오버플로우) */}
      <div className="relative w-full h-56 sm:h-64 bg-gray-100">
        <Image
          src={
            place.imageUrl &&
            (/^(\/|https?:\/\/)/.test(place.imageUrl.trim()))
              ? place.imageUrl
              : '/icons/icon-192x192.png'
          }
          alt={place.name}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
          sizes="(max-width: 768px) 100vw, 400px"
          priority
        />
        {/* 이미지 위 정보 오버레이 */}
        <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black/70 to-transparent px-4 py-3 flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="text-xs bg-white/30 text-white px-2 py-0.5 rounded-full backdrop-blur-sm font-medium shadow">{place.category}</span>
            <span className="text-xs text-gray-200">{place.distance}</span>
          </div>
          <div className="text-lg font-bold text-white drop-shadow-sm truncate">{place.name}</div>
        </div>
      </div>
      {/* 하단 투표 버튼 영역 */}
      <div className="flex items-center justify-between px-4 py-2 bg-white/80 backdrop-blur-sm border-t border-gray-100">
        <div className="flex gap-2">
          <button
            className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-semibold transition ${userVote === 'like' ? 'bg-blue-500 text-white shadow' : 'bg-gray-100 text-gray-700 hover:bg-blue-50'}`}
            onClick={e => {
              e.stopPropagation();
              onVote('like');
            }}
          >
            <span>👍</span> {place.likeCount}
          </button>
          <button
            className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-semibold transition ${userVote === 'no' ? 'bg-red-500 text-white shadow' : 'bg-gray-100 text-gray-700 hover:bg-red-50'}`}
            onClick={e => {
              e.stopPropagation();
              onVote('no');
            }}
          >
            <span>👎</span> {place.noCount}
          </button>
        </div>
        {isFavorite && (
          <div className="flex items-center gap-1 text-yellow-500 text-sm">
            <span>⭐</span>
            <span className="font-medium">즐겨찾기</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default PlaceCard; 