#!/usr/bin/env node

/**
 * 칠 플레이스 더미 데이터 삭제 스크립트
 *
 * 사용법:
 * npm run clear-data
 *
 * 또는 직접 실행:
 * node scripts/clear-dummy-data.js
 */

const { createClient } = require("@supabase/supabase-js");
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

// 더미 데이터 삭제 함수
async function clearDummyData(tableName, filterField, filterValue) {
  console.log(`🗑️  ${tableName} 테이블에서 더미 데이터 삭제 중...`);

  const { error } = await supabase
    .from(tableName)
    .delete()
    .like(filterField, `%${filterValue}%`);

  if (error) {
    console.error(`❌ ${tableName} 삭제 오류:`, error);
    return false;
  }

  console.log(`✅ ${tableName} 더미 데이터 삭제 완료`);
  return true;
}

// 전체 테이블 더미 데이터 삭제
async function clearAllDummyData() {
  console.log("🚀 더미 데이터 삭제를 시작합니다...\n");

  const tables = [
    { name: "favorites", filterField: "created_at", filterValue: "dummy" }, // 생성일 기반으로 최근 것들 삭제
    { name: "votes", filterField: "created_at", filterValue: "dummy" },
    { name: "reviews", filterField: "created_at", filterValue: "dummy" },
    { name: "places", filterField: "name", filterValue: "점" }, // "OOO 강남역점" 형태로 구분
    { name: "profiles", filterField: "username", filterValue: "김민준" }, // 한국 이름으로 구분
  ];

  let totalSuccess = 0;

  for (const table of tables) {
    const success = await clearDummyData(
      table.name,
      table.filterField,
      table.filterValue
    );
    if (success) totalSuccess++;
  }

  console.log(
    `\n🎉 더미 데이터 삭제 완료! (${totalSuccess}/${tables.length} 테이블 성공)`
  );
}

// 더 안전한 삭제 방법 - 최근 생성된 데이터만 삭제
async function clearRecentData() {
  console.log("🚀 최근 생성된 더미 데이터 삭제를 시작합니다...\n");

  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

  const tables = ["favorites", "votes", "reviews", "places", "profiles"];

  for (const tableName of tables) {
    console.log(`🗑️  ${tableName} 테이블에서 최근 데이터 삭제 중...`);

    const { error } = await supabase
      .from(tableName)
      .delete()
      .gte("created_at", yesterday);

    if (error) {
      console.error(`❌ ${tableName} 삭제 오류:`, error);
    } else {
      console.log(`✅ ${tableName} 최근 데이터 삭제 완료`);
    }
  }
}

// 특정 테이블만 삭제
async function clearSpecificTable(tableName) {
  const prefixMap = {
    profiles: "dummy-user",
    places: "dummy-place",
    reviews: "dummy-review",
    votes: "dummy-vote",
    favorites: "dummy-favorite",
  };

  const prefix = prefixMap[tableName];
  if (!prefix) {
    console.error(`❌ 지원하지 않는 테이블명: ${tableName}`);
    console.log("지원하는 테이블: profiles, places, reviews, votes, favorites");
    return;
  }

  await clearDummyData(tableName, "created_at", "dummy");
}

// 메인 실행 함수
async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    // 모든 테이블 삭제
    await clearAllDummyData();
  } else if (args[0] === "--table" && args[1]) {
    // 특정 테이블만 삭제
    await clearSpecificTable(args[1]);
  } else {
    console.log("사용법:");
    console.log(
      "  npm run clear-data                    # 모든 더미 데이터 삭제"
    );
    console.log("  npm run clear-data -- --table places  # 특정 테이블만 삭제");
    console.log("");
    console.log("지원하는 테이블: profiles, places, reviews, votes, favorites");
  }
}

// 스크립트 실행
if (require.main === module) {
  main().catch(console.error);
}
