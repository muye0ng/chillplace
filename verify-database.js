const { createClient } = require("@supabase/supabase-js");
require("dotenv").config();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function verifyDatabase() {
  const problemUserId = "9a88ed8d-f9b1-48e6-9e0d-32b97e5456dd";
  const problemEmail = "chillvibey@gmail.com";

  console.log("=== 문제의 사용자 ID로 직접 검색 ===");
  console.log("검색할 사용자 ID:", problemUserId);
  console.log("검색할 이메일:", problemEmail);

  // 1. users 테이블에서 해당 ID 검색
  console.log("\n1. users 테이블에서 ID로 검색:");
  const { data: userById, error: userByIdError } = await supabase
    .from("users")
    .select("*")
    .eq("id", problemUserId);

  if (userByIdError) {
    console.log("❌ ID 검색 오류:", userByIdError.message);
  } else {
    console.log(
      "📊 ID 검색 결과:",
      userById.length > 0 ? userById : "❌ 해당 ID 없음"
    );
  }

  // 2. users 테이블에서 이메일로 검색
  console.log("\n2. users 테이블에서 이메일로 검색:");
  const { data: userByEmail, error: userByEmailError } = await supabase
    .from("users")
    .select("*")
    .eq("email", problemEmail);

  if (userByEmailError) {
    console.log("❌ 이메일 검색 오류:", userByEmailError.message);
  } else {
    console.log(
      "📊 이메일 검색 결과:",
      userByEmail.length > 0 ? userByEmail : "❌ 해당 이메일 없음"
    );
  }

  // 3. accounts 테이블에서 사용자 ID로 검색
  console.log("\n3. accounts 테이블에서 사용자 ID로 검색:");
  const { data: accountByUserId, error: accountByUserIdError } = await supabase
    .from("accounts")
    .select("*")
    .eq("userId", problemUserId);

  if (accountByUserIdError) {
    console.log("❌ 계정 검색 오류:", accountByUserIdError.message);
  } else {
    console.log(
      "📊 계정 검색 결과:",
      accountByUserId.length > 0
        ? accountByUserId
        : "❌ 해당 사용자 ID 계정 없음"
    );
  }

  // 4. sessions 테이블에서 사용자 ID로 검색
  console.log("\n4. sessions 테이블에서 사용자 ID로 검색:");
  const { data: sessionByUserId, error: sessionByUserIdError } = await supabase
    .from("sessions")
    .select("*")
    .eq("userId", problemUserId);

  if (sessionByUserIdError) {
    console.log("❌ 세션 검색 오류:", sessionByUserIdError.message);
  } else {
    console.log(
      "📊 세션 검색 결과:",
      sessionByUserId.length > 0
        ? sessionByUserId
        : "❌ 해당 사용자 ID 세션 없음"
    );
  }

  // 5. 모든 테이블 전체 조회
  console.log("\n=== 전체 테이블 상태 ===");
  const { data: allUsers } = await supabase.from("users").select("*");
  const { data: allAccounts } = await supabase.from("accounts").select("*");
  const { data: allSessions } = await supabase.from("sessions").select("*");

  console.log("📊 전체 users:", allUsers?.length || 0, "개");
  console.log("📊 전체 accounts:", allAccounts?.length || 0, "개");
  console.log("📊 전체 sessions:", allSessions?.length || 0, "개");

  if (allUsers?.length > 0) {
    console.log("\n🚨 발견된 users:");
    allUsers.forEach((user, index) => {
      console.log(`${index + 1}. ID: ${user.id}, 이메일: ${user.email}`);
    });
  }

  if (allAccounts?.length > 0) {
    console.log("\n🚨 발견된 accounts:");
    allAccounts.forEach((account, index) => {
      console.log(
        `${index + 1}. 사용자 ID: ${account.userId}, 프로바이더: ${
          account.provider
        }`
      );
    });
  }

  if (allSessions?.length > 0) {
    console.log("\n🚨 발견된 sessions:");
    allSessions.forEach((session, index) => {
      console.log(
        `${index + 1}. 사용자 ID: ${session.userId}, 만료: ${session.expires}`
      );
    });
  }
}

verifyDatabase()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ 검증 스크립트 오류:", error);
    process.exit(1);
  });
