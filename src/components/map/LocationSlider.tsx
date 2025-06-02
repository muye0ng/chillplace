// 반경 조절 슬라이더 컴포넌트입니다.
// 위치 기반 검색 반경을 조절할 수 있습니다.
import React from 'react';

export interface LocationSliderProps {
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
}

const LocationSlider: React.FC<LocationSliderProps> = ({ value, min, max, onChange }) => {
  return (
    <div className="flex flex-col gap-2">
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={e => onChange(Number(e.target.value))}
        className="w-full"
      />
      <div className="text-xs text-gray-500">반경: {value}m</div>
    </div>
  );
};

export default LocationSlider; 