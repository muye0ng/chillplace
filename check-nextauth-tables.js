const { createClient } = require("@supabase/supabase-js");
require("dotenv").config();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkTables() {
  console.log("=== NextAuth 테이블 존재 확인 ===");

  const tables = [
    "users",
    "accounts",
    "sessions",
    "profiles",
    "verification_tokens",
  ];

  for (const table of tables) {
    try {
      const { data, error } = await supabase.from(table).select("*").limit(1);
      if (error) {
        console.log(`❌ ${table} 테이블: 오류 - ${error.message}`);
      } else {
        console.log(`✅ ${table} 테이블: 존재 (${data.length}개 행)`);
      }
    } catch (err) {
      console.log(`❌ ${table} 테이블: 예외 - ${err.message}`);
    }
  }

  // 수동으로 사용자 생성 테스트
  console.log("\n=== 수동 사용자 생성 테스트 ===");
  try {
    const testUser = {
      name: "테스트 사용자",
      email: "test@example.com",
      image: "https://example.com/avatar.jpg",
    };

    const { data, error } = await supabase
      .from("users")
      .insert([testUser])
      .select()
      .single();

    if (error) {
      console.log("❌ 사용자 생성 실패:", error.message);
    } else {
      console.log("✅ 사용자 생성 성공:", data);

      // 생성된 테스트 사용자 삭제
      await supabase.from("users").delete().eq("id", data.id);
      console.log("🗑️ 테스트 사용자 삭제 완료");
    }
  } catch (err) {
    console.log("❌ 사용자 생성 예외:", err.message);
  }
}

checkTables().catch(console.error);
