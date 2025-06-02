// 카카오맵 컴포넌트입니다.
// 지도 표시 및 마커 렌더링 예정
import React from 'react';
import { Map, MapMarker } from 'react-kakao-maps-sdk';

export interface KakaoMapProps {
  center: { lat: number; lng: number };
  places: Array<{ id: string; lat: number; lng: number; name: string }>;
  onMarkerClick?: (id: string) => void;
}

const KakaoMap: React.FC<KakaoMapProps> = ({ center, places, onMarkerClick }) => {
  return (
    <div className="w-full h-80 rounded-lg overflow-hidden">
      {/* 실제 카카오맵 렌더링 */}
      <Map center={center} style={{ width: '100%', height: '100%' }} level={4}>
        {/* 장소 마커 렌더링 */}
        {places.map((place) => (
          <MapMarker
            key={place.id}
            position={{ lat: place.lat, lng: place.lng }}
            onClick={() => onMarkerClick?.(place.id)}
          >
            <div className="text-xs font-bold bg-white rounded px-2 py-1 shadow">{place.name}</div>
          </MapMarker>
        ))}
      </Map>
    </div>
  );
};

export default KakaoMap; 