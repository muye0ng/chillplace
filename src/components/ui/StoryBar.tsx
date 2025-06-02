// 스토리/이벤트/온보딩/공지 등 상단 바 컴포넌트
import React from 'react';

export interface StoryItem {
  id: string;
  label: string;
  colorFrom: string;
  colorTo: string;
  onClick?: () => void;
}

interface StoryBarProps {
  stories: StoryItem[];
}

const StoryBar: React.FC<StoryBarProps> = ({ stories }) => {
  return (
    <div className="w-full max-w-md overflow-x-auto flex gap-3 py-3 px-2 scrollbar-hide">
      {stories.map((story) => (
        <div
          key={story.id}
          className={`w-20 h-20 rounded-full bg-gradient-to-tr from-${story.colorFrom} to-${story.colorTo} flex items-center justify-center text-white font-bold text-sm shadow shrink-0 cursor-pointer transition-transform hover:scale-105`}
          onClick={story.onClick}
        >
          {story.label}
        </div>
      ))}
    </div>
  );
};

export default StoryBar; 