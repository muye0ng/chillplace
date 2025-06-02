// 지도 마커 컴포넌트입니다.
// 카카오맵에서 장소 위치를 표시합니다.
import React from 'react';

export interface PlaceMarkerProps {
  lat: number;
  lng: number;
  selected?: boolean;
  onClick?: () => void;
}

const PlaceMarker: React.FC<PlaceMarkerProps> = ({ lat, lng, selected, onClick }) => {
  // TODO: 실제 마커 렌더링은 카카오맵 연동 후 구현
  return (
    <div
      className={`w-6 h-6 rounded-full border-2 ${selected ? 'border-blue-500 bg-blue-300' : 'border-gray-400 bg-white'}`}
      style={{ position: 'absolute', left: 0, top: 0 }}
      onClick={onClick}
      title={`위치: ${lat}, ${lng}`}
    />
  );
};

export default PlaceMarker; 