#!/usr/bin/env node

/**
 * 칠 플레이스 더미 데이터 생성 스크립트
 *
 * 사용법:
 * npm run seed-data
 *
 * 또는 직접 실행:
 * node scripts/seed-dummy-data.js
 */

const { createClient } = require("@supabase/supabase-js");
const { randomUUID } = require("crypto");
require("dotenv").config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("❌ Supabase 환경변수가 설정되지 않았습니다.");
  console.error(
    "NEXT_PUBLIC_SUPABASE_URL 및 SUPABASE_SERVICE_ROLE_KEY를 확인해주세요."
  );
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// 서울 주요 지역 좌표
const seoulAreas = [
  { name: "강남역", lat: 37.4979, lng: 127.0276 },
  { name: "홍대입구", lat: 37.5563, lng: 126.9233 },
  { name: "명동", lat: 37.5636, lng: 126.982 },
  { name: "이태원", lat: 37.5349, lng: 126.9955 },
  { name: "신촌", lat: 37.5596, lng: 126.937 },
  { name: "잠실", lat: 37.5133, lng: 127.1028 },
  { name: "건대입구", lat: 37.5401, lng: 127.0699 },
  { name: "신사동", lat: 37.5177, lng: 127.0198 },
  { name: "압구정", lat: 37.5223, lng: 127.0296 },
  { name: "여의도", lat: 37.5216, lng: 126.9246 },
];

// 카테고리별 장소 데이터
const placeCategories = {
  카페: [
    "블루보틀 커피",
    "스타벅스",
    "투썸플레이스",
    "이디야커피",
    "커피빈",
    "폴바셋",
    "A TWOSOME PLACE",
    "할리스커피",
    "더벤티",
    "컴포즈커피",
    "테라로사",
    "프릳츠커피",
    "모모스커피",
    "엔젤리너스",
    "공차",
  ],
  음식점: [
    "마라탕후루",
    "곱창 고수",
    "더진국",
    "본죽",
    "김치찌개와 낙지볶음",
    "백종원의 더본코리아",
    "노브랜드버거",
    "맥도날드",
    "KFC",
    "버거킹",
    "서브웨이",
    "도미노피자",
    "파파존스",
    "피자헛",
    "치킨플러스",
  ],
  술집: [
    "호프집",
    "맥주창고",
    "카스 하우스",
    "호가든",
    "하이네켄 바",
    "칵테일 바",
    "와인바",
    "소주방",
    "막걸리집",
    "펍",
    "루프탑 바",
    "스카이라운지",
    "비어가든",
    "호프하우스",
    "브루어리",
  ],
  쇼핑: [
    "이마트",
    "롯데마트",
    "홈플러스",
    "GS25",
    "CU",
    "세븐일레븐",
    "미니스톱",
    "이마트24",
    "올리브영",
    "다이소",
    "아웃백",
    "현대백화점",
    "롯데백화점",
    "신세계백화점",
    "동대문시장",
  ],
  "문화/여가": [
    "CGV",
    "롯데시네마",
    "메가박스",
    "PC방",
    "노래방",
    "볼링장",
    "당구장",
    "찜질방",
    "헬스장",
    "수영장",
    "도서관",
    "박물관",
    "미술관",
    "공원",
    "놀이공원",
  ],
};

// 리뷰 템플릿
const reviewTemplates = {
  positive: [
    "정말 좋은 곳이에요! 분위기도 좋고 음식도 맛있어요.",
    "친구들과 가기 좋은 장소입니다. 추천해요!",
    "깔끔하고 서비스도 친절해서 만족스러웠어요.",
    "가격 대비 만족도가 높습니다. 재방문 의사 있어요.",
    "인테리어가 예쁘고 음식 맛도 훌륭해요.",
    "데이트 코스로 딱 좋은 것 같아요.",
    "직원분들이 정말 친절하세요. 기분 좋게 다녀왔어요.",
    "혼자 가기에도 부담없고 좋은 곳이에요.",
    "가족들과 함께 가기 좋은 분위기입니다.",
    "특별한 날에 방문하기 좋은 곳이에요.",
  ],
  neutral: [
    "괜찮은 곳이에요. 평범하지만 나쁘지 않아요.",
    "그냥 저냥 무난한 곳입니다.",
    "기대했던 것보다는 평범했어요.",
    "특별하지는 않지만 갈만해요.",
    "보통 수준이에요. 한 번 가보는 정도?",
    "딱히 나쁘지도 좋지도 않은 곳.",
    "평타는 치는 곳이라고 생각해요.",
    "무난하게 시간 보내기 좋아요.",
    "가격을 생각하면 적당한 것 같아요.",
    "친구가 추천해서 갔는데 그냥 그래요.",
  ],
  negative: [
    "기대했는데 좀 아쉬웠어요.",
    "가격에 비해 만족도가 낮았습니다.",
    "직원 서비스가 좀 아쉬웠어요.",
    "음식이 생각보다 별로였어요.",
    "분위기는 좋은데 맛이 아쉽네요.",
    "웨이팅이 너무 길어서 힘들었어요.",
    "청결도가 좀 신경쓰였어요.",
    "다시 갈 것 같지는 않아요.",
    "리뷰 보고 갔는데 기대에 못 미쳤어요.",
    "좀 더 개선이 필요한 것 같아요.",
  ],
};

// 한국 이름 목록
const koreanNames = [
  "김민준",
  "이서윤",
  "박도윤",
  "최서준",
  "정하은",
  "강시우",
  "조유나",
  "윤지호",
  "장수아",
  "임도현",
  "한예준",
  "오하윤",
  "신시은",
  "배준우",
  "송지우",
  "류서연",
  "홍예은",
  "양민성",
  "고은우",
  "문채원",
  "서준혁",
  "노아윤",
  "권도운",
  "남시현",
  "유지안",
  "전소율",
  "손우진",
  "황서영",
  "조민재",
  "구하린",
  "백도율",
  "주연우",
];

// 더미 사용자 생성
function generateDummyUsers(count = 50) {
  const users = [];
  for (let i = 0; i < count; i++) {
    const name = koreanNames[Math.floor(Math.random() * koreanNames.length)];
    const randomNum = Math.floor(Math.random() * 9999);

    users.push({
      id: randomUUID(),
      username: `${name}${randomNum}`,
      full_name: name,
      avatar_url: `https://picsum.photos/seed/user${i}/100/100`,
      preferred_language: "ko",
      interested_categories: getRandomCategories(),
      location_radius: Math.floor(Math.random() * 5) + 1,
      created_at: new Date(
        Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000
      ).toISOString(),
      updated_at: new Date().toISOString(),
    });
  }
  return users;
}

// 더미 장소 생성
function generateDummyPlaces(count = 100) {
  const places = [];

  for (let i = 0; i < count; i++) {
    const categories = Object.keys(placeCategories);
    const category = categories[Math.floor(Math.random() * categories.length)];
    const placeNames = placeCategories[category];
    const placeName = placeNames[Math.floor(Math.random() * placeNames.length)];
    const area = seoulAreas[Math.floor(Math.random() * seoulAreas.length)];

    // 지역 주변으로 좌표 분산
    const latOffset = (Math.random() - 0.5) * 0.02; // 약 1km 반경
    const lngOffset = (Math.random() - 0.5) * 0.02;

    places.push({
      id: randomUUID(),
      kakao_place_id: `kakao-${Math.floor(Math.random() * 1000000)}`,
      name: `${placeName} ${area.name}점`,
      category: category,
      address: `서울시 ${area.name} 인근 ${
        Math.floor(Math.random() * 999) + 1
      }번지`,
      phone: `02-${Math.floor(Math.random() * 9000) + 1000}-${
        Math.floor(Math.random() * 9000) + 1000
      }`,
      latitude: area.lat + latOffset,
      longitude: area.lng + lngOffset,
      image_url: `https://picsum.photos/seed/place${i}/400/300`,
      created_at: new Date(
        Date.now() - Math.random() * 180 * 24 * 60 * 60 * 1000
      ).toISOString(),
      updated_at: new Date().toISOString(),
    });
  }

  return places;
}

// 더미 리뷰 생성
function generateDummyReviews(users, places, count = 300) {
  const reviews = [];

  for (let i = 0; i < count; i++) {
    const user = users[Math.floor(Math.random() * users.length)];
    const place = places[Math.floor(Math.random() * places.length)];

    // 평점에 따른 리뷰 타입 결정
    const rating = Math.floor(Math.random() * 5) + 1;
    let reviewType;
    if (rating >= 4) reviewType = "positive";
    else if (rating >= 3) reviewType = "neutral";
    else reviewType = "negative";

    const templates = reviewTemplates[reviewType];
    const content = templates[Math.floor(Math.random() * templates.length)];

    reviews.push({
      id: randomUUID(),
      user_id: user.id,
      place_id: place.id,
      content: content,
      image_url:
        Math.random() > 0.7
          ? `https://picsum.photos/seed/review${i}/400/300`
          : null,
      helpful_count: Math.floor(Math.random() * 20),
      created_at: new Date(
        Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000
      ).toISOString(),
      updated_at: new Date().toISOString(),
    });
  }

  return reviews;
}

// 더미 투표 생성
function generateDummyVotes(users, places, count = 500) {
  const votes = [];
  const usedCombinations = new Set();

  for (let i = 0; i < count; i++) {
    let user, place, combination;

    // 중복 방지
    do {
      user = users[Math.floor(Math.random() * users.length)];
      place = places[Math.floor(Math.random() * places.length)];
      combination = `${user.id}-${place.id}`;
    } while (usedCombinations.has(combination));

    usedCombinations.add(combination);

    votes.push({
      id: randomUUID(),
      user_id: user.id,
      place_id: place.id,
      vote_type: Math.random() > 0.3 ? "like" : "no", // 70% 좋아요
      created_at: new Date(
        Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000
      ).toISOString(),
    });
  }

  return votes;
}

// 더미 즐겨찾기 생성
function generateDummyFavorites(users, places, count = 200) {
  const favorites = [];
  const usedCombinations = new Set();

  for (let i = 0; i < count; i++) {
    let user, place, combination;

    // 중복 방지
    do {
      user = users[Math.floor(Math.random() * users.length)];
      place = places[Math.floor(Math.random() * places.length)];
      combination = `${user.id}-${place.id}`;
    } while (usedCombinations.has(combination));

    usedCombinations.add(combination);

    favorites.push({
      id: randomUUID(),
      user_id: user.id,
      place_id: place.id,
      created_at: new Date(
        Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000
      ).toISOString(),
    });
  }

  return favorites;
}

// 랜덤 카테고리 선택
function getRandomCategories() {
  const categories = Object.keys(placeCategories);
  const count = Math.floor(Math.random() * 3) + 1; // 1-3개
  const selected = [];

  for (let i = 0; i < count; i++) {
    const category = categories[Math.floor(Math.random() * categories.length)];
    if (!selected.includes(category)) {
      selected.push(category);
    }
  }

  return selected;
}

// 데이터 삽입 함수
async function insertData(tableName, data, batchSize = 100) {
  console.log(`📝 ${tableName} 테이블에 ${data.length}개 데이터 삽입 중...`);

  for (let i = 0; i < data.length; i += batchSize) {
    const batch = data.slice(i, i + batchSize);
    const { error } = await supabase
      .from(tableName)
      .upsert(batch, { onConflict: "id" });

    if (error) {
      console.error(
        `❌ ${tableName} 삽입 오류 (배치 ${Math.floor(i / batchSize) + 1}):`,
        error
      );
      continue;
    }

    console.log(
      `✅ ${tableName} 배치 ${Math.floor(i / batchSize) + 1}/${Math.ceil(
        data.length / batchSize
      )} 완료`
    );
  }
}

// 메인 실행 함수
async function main() {
  console.log("🚀 칠 플레이스 더미 데이터 생성을 시작합니다...\n");

  try {
    // 1. 사용자 데이터 생성 및 삽입
    console.log("👥 더미 사용자 생성 중...");
    const users = generateDummyUsers(50);
    await insertData("profiles", users);

    // 2. 장소 데이터 생성 및 삽입
    console.log("\n📍 더미 장소 생성 중...");
    const places = generateDummyPlaces(100);
    await insertData("places", places);

    // 3. 리뷰 데이터 생성 및 삽입
    console.log("\n📝 더미 리뷰 생성 중...");
    const reviews = generateDummyReviews(users, places, 300);
    await insertData("reviews", reviews);

    // 4. 투표 데이터 생성 및 삽입
    console.log("\n👍 더미 투표 생성 중...");
    const votes = generateDummyVotes(users, places, 500);
    await insertData("votes", votes);

    // 5. 즐겨찾기 데이터 생성 및 삽입
    console.log("\n⭐ 더미 즐겨찾기 생성 중...");
    const favorites = generateDummyFavorites(users, places, 200);
    await insertData("favorites", favorites);

    console.log("\n🎉 모든 더미 데이터 생성이 완료되었습니다!");
    console.log("\n📊 생성된 데이터 요약:");
    console.log(`   👥 사용자: ${users.length}명`);
    console.log(`   📍 장소: ${places.length}개`);
    console.log(`   📝 리뷰: ${reviews.length}개`);
    console.log(`   👍 투표: ${votes.length}개`);
    console.log(`   ⭐ 즐겨찾기: ${favorites.length}개`);
  } catch (error) {
    console.error("❌ 더미 데이터 생성 중 오류가 발생했습니다:", error);
    process.exit(1);
  }
}

// 스크립트 실행
if (require.main === module) {
  main();
}

module.exports = {
  generateDummyUsers,
  generateDummyPlaces,
  generateDummyReviews,
  generateDummyVotes,
  generateDummyFavorites,
};
