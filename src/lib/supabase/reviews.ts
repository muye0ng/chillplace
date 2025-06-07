// 리뷰 관련 Supabase 함수 모음입니다.
// 리뷰 생성, 조회 등 함수 뼈대 제공
import { supabase } from './client';

// 리뷰 목록 조회
export async function fetchReviews(placeId: string) {
  // 실제 구현은 supabase.from('reviews').select() 등 사용
  return supabase.from('reviews').select('*').eq('place_id', placeId);
}

// 리뷰 생성
export async function createReview(placeId: string, content: string, rating: number, imageUrl?: string) {
  // 실제 구현은 supabase.from('reviews').insert() 등 사용
  return supabase.from('reviews').insert([{ place_id: placeId, content, rating, image_url: imageUrl }]);
}

// 리뷰 이미지 업로드 함수 (Supabase Storage 사용)
export async function uploadReviewImage(file: File, placeId: string) {
  // 파일명을 고유하게 생성 (예: placeId-timestamp)
  const fileName = `${placeId}-${Date.now()}-${file.name}`;
  const { error } = await supabase.storage.from('review-images').upload(fileName, file);
  if (error) throw error;
  // publicUrl 반환
  const { publicUrl } = supabase.storage.from('review-images').getPublicUrl(fileName).data;
  return publicUrl;
}

// 여러 user_id에 대한 username을 한 번에 조회하는 함수
export async function fetchReviewAuthors(userIds: string[]) {
  // Supabase profiles 테이블에서 id in userIds로 username 조회
  const { data, error } = await supabase
    .from('profiles')
    .select('id, username')
    .in('id', userIds);
  // 결과를 id: username 형태의 맵으로 변환
  const map: Record<string, string> = {};
  if (data) {
    data.forEach((row: { id: string; username: string }) => {
      map[row.id] = row.username;
    });
  }
  return { data: map, error };
}

// 리뷰 도움돼요(Helpful) 투표 추가
export async function addReviewHelpful(reviewId: string) {
  // 현재 로그인 유저가 해당 리뷰에 도움돼요 투표 추가
  return supabase.from('review_helpful').insert([{ review_id: reviewId }]);
}

// 리뷰 도움돼요(Helpful) 투표 해제
export async function removeReviewHelpful(reviewId: string) {
  // 현재 로그인 유저가 해당 리뷰에 도움돼요 투표 해제
  return supabase.from('review_helpful').delete().eq('review_id', reviewId);
}

// 내가 해당 리뷰에 도움돼요 투표했는지 확인
export async function isReviewHelpful(reviewId: string) {
  const { data, error } = await supabase.from('review_helpful').select('*').eq('review_id', reviewId).single();
  return { isHelpful: !!data, error };
}

// 내가 쓴 리뷰 전체 조회
export async function fetchMyReviews(userId: string) {
  // 내 user_id로 리뷰 전체 조회, place 정보 조인
  return supabase.from('reviews').select('*, places(*)').eq('user_id', userId).order('created_at', { ascending: false });
}

// 테스트용 더미 리뷰 생성 (개발 환경에서만 사용)
export async function createTestReviews(placeId: string) {
  console.log('=== 테스트 리뷰 생성 시작 ===');
  console.log('장소 ID:', placeId);
  
  // 현재 로그인한 사용자 확인
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  console.log('현재 사용자:', { user: user ? { id: user.id, email: user.email } : null, error: userError });
  
  if (!user) {
    console.error('❌ 로그인이 필요합니다. 테스트 리뷰를 생성하려면 먼저 로그인하세요.');
    throw new Error('로그인이 필요합니다. 테스트 리뷰를 생성하려면 먼저 로그인하세요.');
  }
  
  const testReviews = [
    {
      user_id: user.id, // 현재 로그인한 사용자 ID 추가
      place_id: placeId,
      content: "정말 좋은 곳이에요! 분위기도 좋고 음식도 맛있어요.",
      rating: 5, // 별점 추가 (스키마에서 NOT NULL)
      helpful_count: 12
    },
    {
      user_id: user.id,
      place_id: placeId,
      content: "친구들과 가기 좋은 장소입니다. 추천해요!",
      rating: 4,
      helpful_count: 8
    },
    {
      user_id: user.id,
      place_id: placeId,
      content: "괜찮은 곳이에요. 평범하지만 나쁘지 않아요.",
      rating: 3,
      helpful_count: 3
    },
    {
      user_id: user.id,
      place_id: placeId,
      content: "기대했는데 좀 아쉬웠어요.",
      rating: 2,
      helpful_count: 1
    }
  ];

  const results = [];
  for (const [index, review] of testReviews.entries()) {
    try {
      console.log(`${index + 1}번째 리뷰 생성 시도:`, review);
      const { data, error } = await supabase.from('reviews').insert([review]).select().single();
      
      if (error) {
        console.error(`${index + 1}번째 리뷰 생성 오류:`, error);
        console.error('오류 세부사항:', JSON.stringify(error, null, 2));
        console.error('오류 메시지:', error.message);
        console.error('오류 코드:', error.code);
        console.error('오류 상세:', error.details);
      } else if (data) {
        console.log(`${index + 1}번째 리뷰 생성 성공:`, data);
        results.push(data);
      } else {
        console.warn(`${index + 1}번째 리뷰: 데이터도 오류도 없음`);
      }
    } catch (err) {
      console.error(`${index + 1}번째 리뷰 생성 예외:`, err);
      console.error('예외 타입:', typeof err);
      console.error('예외 세부사항:', JSON.stringify(err, null, 2));
    }
  }
  console.log('=== 테스트 리뷰 생성 완료 ===');
  console.log('총 생성된 테스트 리뷰 수:', results.length);
  return results;
}

// 테이블 구조 확인용 함수 (개발 환경에서만 사용)
export async function checkReviewsTableStructure() {
  console.log('=== 리뷰 테이블 구조 확인 시작 ===');
  
  try {
    // 1. 기존 리뷰 데이터 확인
    console.log('1. 기존 리뷰 데이터 조회 중...');
    const { data: existingData, error: selectError } = await supabase
      .from('reviews')
      .select('*')
      .limit(3);
    
    console.log('기존 리뷰 조회 결과:', { data: existingData, error: selectError });
    
    if (selectError) {
      console.error('기존 리뷰 조회 오류:', JSON.stringify(selectError, null, 2));
    }
    
    // 2. 테이블 스키마 정보 확인 (메타데이터)
    console.log('2. 테이블 메타데이터 확인 중...');
    const { data: schemaData, error: schemaError } = await supabase.rpc('get_table_schema', { table_name: 'reviews' });
    console.log('스키마 조회 결과:', { data: schemaData, error: schemaError });
    
    // 3. 간단한 테스트 삽입 시도
    console.log('3. 테스트 삽입 시도 중...');
    const testReview = {
      place_id: 'test-place-id-' + Date.now(),
      content: 'test content for structure check'
    };
    
    const { data: testData, error: testError } = await supabase
      .from('reviews')
      .insert([testReview])
      .select()
      .single();
    
    console.log('테스트 삽입 결과:', { data: testData, error: testError });
    
    if (testError) {
      console.error('테스트 삽입 오류 세부사항:', JSON.stringify(testError, null, 2));
    }
    
    // 4. 테스트 데이터 삭제 (성공했다면)
    if (testData) {
      console.log('4. 테스트 데이터 삭제 중...');
      const { error: deleteError } = await supabase
        .from('reviews')
        .delete()
        .eq('id', testData.id);
      
      if (deleteError) {
        console.error('테스트 데이터 삭제 오류:', deleteError);
      } else {
        console.log('테스트 데이터 삭제 완료');
      }
    }
    
    console.log('=== 리뷰 테이블 구조 확인 완료 ===');
    return { success: true, existingData, selectError, testData, testError };
    
  } catch (err) {
    console.error('테이블 구조 확인 중 예외 발생:', err);
    console.error('예외 세부사항:', JSON.stringify(err, null, 2));
    return { success: false, error: err };
  }
}

// Supabase 연결 상태 확인 함수
export async function checkSupabaseConnection() {
  console.log('=== Supabase 연결 상태 확인 ===');
  
  // 환경변수 확인
  console.log('환경변수 확인:');
  console.log('SUPABASE_URL 존재:', !!process.env.NEXT_PUBLIC_SUPABASE_URL);
  console.log('SUPABASE_ANON_KEY 존재:', !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  console.log('SUPABASE_URL 앞부분:', process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 30) + '...');
  
  try {
    // 간단한 연결 테스트
    const { data, error } = await supabase.from('places').select('id').limit(1);
    console.log('Places 테이블 연결 테스트:', { data, error });
    
    // 현재 사용자 확인
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    console.log('현재 사용자:', { user: user ? { id: user.id, email: user.email } : null, error: userError });
    
    return { success: !error, data, error };
  } catch (err) {
    console.error('연결 테스트 중 예외:', err);
    return { success: false, error: err };
  }
} 