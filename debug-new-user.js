const { createClient } = require("@supabase/supabase-js");
require("dotenv").config();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function debugNewUser() {
  console.log("=== 현재 데이터베이스 상태 확인 ===");

  // 모든 사용자 조회
  const { data: allUsers, error: usersError } = await supabase
    .from("users")
    .select("*")
    .order("createdAt", { ascending: false });

  if (usersError) {
    console.log("❌ 사용자 조회 오류:", usersError.message);
  } else {
    console.log("📊 전체 사용자 수:", allUsers.length);
    if (allUsers.length > 0) {
      console.log("🔍 최근 사용자들:");
      allUsers.slice(0, 3).forEach((user, index) => {
        console.log(`${index + 1}. ID: ${user.id}`);
        console.log(`   이메일: ${user.email}`);
        console.log(`   이름: ${user.name}`);
        console.log(`   생성일: ${user.createdAt}`);
        console.log(`   수정일: ${user.updatedAt}`);
        console.log("");
      });
    }
  }

  // 모든 계정 조회
  const { data: allAccounts, error: accountsError } = await supabase
    .from("accounts")
    .select("*")
    .order("createdAt", { ascending: false });

  if (accountsError) {
    console.log("❌ 계정 조회 오류:", accountsError.message);
  } else {
    console.log("📊 전체 OAuth 계정 수:", allAccounts.length);
    if (allAccounts.length > 0) {
      console.log("🔍 최근 OAuth 계정들:");
      allAccounts.slice(0, 3).forEach((account, index) => {
        console.log(`${index + 1}. 사용자 ID: ${account.userId}`);
        console.log(`   프로바이더: ${account.provider}`);
        console.log(`   프로바이더 계정 ID: ${account.providerAccountId}`);
        console.log(`   생성일: ${account.createdAt}`);
        console.log("");
      });
    }
  }

  // 활성 세션 조회
  const { data: allSessions, error: sessionsError } = await supabase
    .from("sessions")
    .select("*")
    .order("expires", { ascending: false });

  if (sessionsError) {
    console.log("❌ 세션 조회 오류:", sessionsError.message);
  } else {
    console.log("📊 활성 세션 수:", allSessions.length);
    if (allSessions.length > 0) {
      console.log("🔍 활성 세션들:");
      allSessions.forEach((session, index) => {
        console.log(`${index + 1}. 사용자 ID: ${session.userId}`);
        console.log(
          `   세션 토큰: ${session.sessionToken.substring(0, 20)}...`
        );
        console.log(`   만료일: ${session.expires}`);
        console.log("");
      });
    }
  }

  console.log("=== 구글 계정 정보 확인 ===");
  const googleProviderAccountId = "100026903285325000304";

  const { data: googleAccount, error: googleError } = await supabase
    .from("accounts")
    .select("*")
    .eq("provider", "google")
    .eq("providerAccountId", googleProviderAccountId);

  if (googleError) {
    console.log("❌ 구글 계정 조회 오류:", googleError.message);
  } else {
    if (googleAccount.length > 0) {
      console.log("🚨 문제 발견: 삭제되었어야 할 구글 계정이 여전히 존재!");
      console.log("계정 정보:", googleAccount[0]);
    } else {
      console.log("✅ 구글 계정이 정상적으로 삭제됨");
    }
  }
}

debugNewUser()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ 디버그 스크립트 오류:", error);
    process.exit(1);
  });
