// (main) 상세 페이지 not-found 템플릿
// 잘못된 id, 없는 장소 접근 시 표시
export default function PlaceNotFound() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-white to-blue-50">
      <h1 className="text-2xl font-bold mb-4">장소를 찾을 수 없습니다</h1>
      <p className="text-gray-500">존재하지 않는 장소이거나, 잘못된 경로입니다.</p>
    </main>
  );
} 