'use client';

// (main) 장소 등록 페이지 템플릿
// 장소명, 카테고리, 위치, 이미지 업로드, 등록 버튼 포함
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createPlace, uploadPlaceImage } from '@/lib/supabase/places';
import KakaoMap from '@/components/map/KakaoMap';
import { reverseGeocode } from '@/lib/kakao/maps';
import { useSWRConfig } from 'swr';

export default function PlaceNewPage() {
  // 폼 상태 관리
  const [name, setName] = useState('');
  const [category, setCategory] = useState('카페');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  // 지도에서 선택한 위치 상태
  const [mapLat, setMapLat] = useState<number | null>(null);
  const [mapLng, setMapLng] = useState<number | null>(null);
  const [address, setAddress] = useState('');
  const { mutate } = useSWRConfig();

  // 등록 버튼 클릭 시 Supabase에 장소 등록
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    // 입력값 검증
    if (!name.trim()) {
      setMessage('장소명을 입력해 주세요.');
      return;
    }
    if (!latitude || !longitude) {
      setMessage('위도와 경도를 입력해 주세요.');
      return;
    }
    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);
    if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      setMessage('위도/경도 값이 올바르지 않습니다.');
      return;
    }
    if (image) {
      if (!image.type.startsWith('image/')) {
        setMessage('이미지 파일만 업로드할 수 있습니다.');
        return;
      }
      if (image.size > 5 * 1024 * 1024) {
        setMessage('이미지 용량은 5MB 이하만 가능합니다.');
        return;
      }
    }
    setLoading(true);
    try {
      let imageUrl = '';
      if (image) {
        imageUrl = await uploadPlaceImage(image, name);
      }
      const { error } = await createPlace({
        kakao_place_id: '',
        name,
        category,
        address,
        latitude: lat,
        longitude: lng,
        image_url: imageUrl,
      });
      if (error) {
        setMessage('등록 중 오류가 발생했습니다: ' + error.message);
      } else {
        setMessage('장소가 성공적으로 등록되었습니다!');
        mutate('places');
        setTimeout(() => {
          router.push('/ko');
        }, 1200);
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setMessage('알 수 없는 오류: ' + err.message);
      } else {
        setMessage('알 수 없는 오류가 발생했습니다.');
      }
    } finally {
      setLoading(false);
    }
  };

  // 지도 클릭 시 위도/경도 입력란 자동 채우기 + 주소 자동 조회
  const handleMapClick = async (lat: number, lng: number) => {
    setLatitude(lat.toString());
    setLongitude(lng.toString());
    setMapLat(lat);
    setMapLng(lng);
    setMessage('지도에서 선택한 위치로 위도/경도, 주소가 자동 입력되었습니다.');
    try {
      const addr = await reverseGeocode(lat, lng);
      setAddress(addr);
    } catch {
      setAddress('');
    }
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-white to-blue-50">
      <h1 className="text-2xl font-bold mb-4">장소 등록</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 bg-white rounded-2xl p-6 shadow max-w-md w-full">
        <label className="flex flex-col gap-1">
          <span className="font-semibold">장소명</span>
          <input type="text" value={name} onChange={e => setName(e.target.value)} required className="border rounded px-3 py-2" placeholder="예: 카페 오늘" />
        </label>
        <label className="flex flex-col gap-1">
          <span className="font-semibold">카테고리</span>
          <select value={category} onChange={e => setCategory(e.target.value)} className="border rounded px-3 py-2">
            <option value="카페">카페</option>
            <option value="음식점">음식점</option>
            <option value="공원">공원</option>
            <option value="기타">기타</option>
          </select>
        </label>
        <div className="flex gap-2">
          <label className="flex flex-col gap-1 flex-1">
            <span className="font-semibold">위도</span>
            <input type="number" value={latitude} onChange={e => setLatitude(e.target.value)} required className="border rounded px-3 py-2" placeholder="예: 37.5665" step="any" />
          </label>
          <label className="flex flex-col gap-1 flex-1">
            <span className="font-semibold">경도</span>
            <input type="number" value={longitude} onChange={e => setLongitude(e.target.value)} required className="border rounded px-3 py-2" placeholder="예: 126.9780" step="any" />
          </label>
        </div>
        <label className="flex flex-col gap-1">
          <span className="font-semibold">이미지 업로드</span>
          <input type="file" accept="image/*" onChange={e => setImage(e.target.files?.[0] || null)} />
          {image && <span className="text-xs text-gray-500">{image.name}</span>}
        </label>
        <label className="flex flex-col gap-1">
          <span className="font-semibold">주소</span>
          <input type="text" value={address} onChange={e => setAddress(e.target.value)} className="border rounded px-3 py-2" placeholder="주소를 입력하거나 지도에서 선택하세요." />
        </label>
        <button type="submit" className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 rounded-lg transition" disabled={loading}>{loading ? '등록 중...' : '장소 등록'}</button>
        {message && <div className="text-center text-blue-500 mt-2">{message}</div>}
      </form>
      {/* 지도에서 위치 선택 */}
      <div className="w-full max-w-md mb-4">
        <KakaoMap
          center={{ lat: mapLat ?? 37.5665, lng: mapLng ?? 126.9780 }}
          places={[]}
          onMarkerClick={() => {}}
          // 지도 클릭 시 위도/경도 입력
          onClickMap={handleMapClick}
        />
      </div>
    </main>
  );
} 