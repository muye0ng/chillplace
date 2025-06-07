const { createClient } = require("@supabase/supabase-js");
require("dotenv").config();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function cleanup() {
  console.log("🧹 기존 테스트 데이터 정리...");

  // 테스트 사용자 삭제
  const { error } = await supabase
    .from("users")
    .delete()
    .eq("email", "test@example.com");

  if (error) {
    console.log("⚠️ 테스트 사용자 삭제 오류:", error.message);
  } else {
    console.log("✅ 테스트 데이터 정리 완료");
  }

  // 정리 후 상태 확인
  const { data: remainingUsers } = await supabase.from("users").select("*");

  console.log("📊 정리 후 남은 사용자 수:", remainingUsers?.length || 0);
}

cleanup().then(() => process.exit(0));
