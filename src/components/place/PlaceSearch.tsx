// 장소 검색 컴포넌트입니다.
// 카카오 API 연동 및 자동완성 검색 지원 예정
import React from 'react';

export interface PlaceSearchProps {
  onSearch: (query: string) => void;
}

const PlaceSearch: React.FC<PlaceSearchProps> = ({ onSearch }) => {
  const [query, setQuery] = React.useState('');

  // TODO: debounce 및 카카오 API 연동 구현

  return (
    <form className="flex gap-2 mb-4" onSubmit={e => { e.preventDefault(); onSearch(query); }}>
      <input
        type="text"
        className="border rounded p-2 flex-1"
        placeholder="장소를 검색하세요"
        value={query}
        onChange={e => setQuery(e.target.value)}
      />
      <button type="submit" className="bg-blue-500 text-white rounded px-4">검색</button>
    </form>
  );
};

export default PlaceSearch; 