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
  onToggleFavorite?: () => void; // 즐겨찾기 토글 핸들러
  onClick?: () => void; // 카드 클릭 시 핸들러(상세 이동)
}

const PlaceCard: React.FC<PlaceCardProps> = ({ place, onVote, userVote, isFavorite, onToggleFavorite, onClick }) => {
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
        {/* 즐겨찾기 하트 버튼 (우상단, 반투명) */}
        <button
          className="absolute top-3 right-3 text-white/90 hover:scale-110 transition z-10 backdrop-blur-sm bg-black/30 rounded-full p-1"
          aria-label={isFavorite ? '즐겨찾기 해제' : '즐겨찾기 추가'}
          onClick={e => {
            e.stopPropagation();
            if (onToggleFavorite) onToggleFavorite();
          }}
        >
          {isFavorite ? (
            <svg width="26" height="26" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41 0.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
          ) : (
            <svg width="26" height="26" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41 0.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
          )}
        </button>
      </div>
      {/* 하단 투표/즐겨찾기 버튼 영역 */}
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
      </div>
    </div>
  );
};

export default PlaceCard; 