const { createClient } = require("@supabase/supabase-js");
require("dotenv").config();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkAccountsSchema() {
  console.log("=== accounts 테이블 스키마 확인 ===");

  try {
    // PostgREST API로 직접 테이블 구조 확인
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/accounts?limit=0`,
      {
        headers: {
          apikey: process.env.SUPABASE_SERVICE_ROLE_KEY,
          Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("✅ PostgREST 응답 헤더:");
    console.log("  - Content-Range:", response.headers.get("content-range"));
    console.log("  - Content-Type:", response.headers.get("content-type"));

    // 실제 데이터 삽입 테스트
    console.log("\n=== accounts 테이블 삽입 테스트 ===");
    const testAccount = {
      userId: "00000000-0000-0000-0000-000000000000",
      type: "oauth",
      provider: "test",
      providerAccountId: "test123",
      refresh_token_expires_in: 5184000,
    };

    const { data, error } = await supabase
      .from("accounts")
      .insert([testAccount])
      .select();

    if (error) {
      console.log("❌ 삽입 실패:", error.message);
      console.log("   상세:", error);
    } else {
      console.log("✅ 삽입 성공:", data);

      // 테스트 데이터 삭제
      await supabase.from("accounts").delete().eq("provider", "test");
      console.log("🗑️ 테스트 데이터 삭제 완료");
    }
  } catch (err) {
    console.log("❌ 예외:", err.message);
  }
}

checkAccountsSchema().catch(console.error);
