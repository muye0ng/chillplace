// 장소 상세 정보 컴포넌트입니다.
// 장소 정보, 주소, 전화번호, 카테고리 등을 표시합니다.
import React from 'react';

export interface PlaceDetailProps {
  place: {
    id: string;
    name: string;
    category: string;
    address: string;
    phone?: string;
    imageUrl?: string;
  };
}

const PlaceDetail: React.FC<PlaceDetailProps> = ({ place }) => {
  return (
    <div className="bg-white rounded-xl shadow p-4 mb-3 flex flex-col">
      {/* 장소 이미지 */}
      {place.imageUrl && (
        <img src={place.imageUrl} alt={place.name} className="w-full h-40 object-cover rounded-lg mb-2" />
      )}
      <div className="font-bold text-lg mb-1">{place.name}</div>
      <div className="text-xs text-gray-500 mb-1">{place.category}</div>
      <div className="text-xs text-gray-500 mb-1">{place.address}</div>
      {place.phone && <div className="text-xs text-gray-500">{place.phone}</div>}
    </div>
  );
};

export default PlaceDetail; 