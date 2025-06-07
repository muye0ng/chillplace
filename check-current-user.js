const { createClient } = require("@supabase/supabase-js");
require("dotenv").config();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkCurrentUser() {
  const userEmail = "chillvibey@gmail.com";
  const userId = "9a88ed8d-f9b1-48e6-9e0d-32b97e5456dd";

  console.log("=== 현재 사용자 데이터 확인 ===");
  console.log("확인할 이메일:", userEmail);
  console.log("확인할 사용자 ID:", userId);

  // 1. users 테이블 확인
  console.log("\n1. users 테이블 확인:");
  const { data: users, error: usersError } = await supabase
    .from("users")
    .select("*")
    .eq("email", userEmail);

  if (usersError) {
    console.log("❌ users 테이블 오류:", usersError.message);
  } else {
    console.log(
      "✅ users 테이블 결과:",
      users.length > 0 ? users : "데이터 없음"
    );
  }

  // 2. accounts 테이블 확인
  console.log("\n2. accounts 테이블 확인:");
  const { data: accounts, error: accountsError } = await supabase
    .from("accounts")
    .select("*")
    .eq("userId", userId);

  if (accountsError) {
    console.log("❌ accounts 테이블 오류:", accountsError.message);
  } else {
    console.log(
      "✅ accounts 테이블 결과:",
      accounts.length > 0 ? accounts : "데이터 없음"
    );
  }

  // 3. sessions 테이블 확인
  console.log("\n3. sessions 테이블 확인:");
  const { data: sessions, error: sessionsError } = await supabase
    .from("sessions")
    .select("*")
    .eq("userId", userId);

  if (sessionsError) {
    console.log("❌ sessions 테이블 오류:", sessionsError.message);
  } else {
    console.log(
      "✅ sessions 테이블 결과:",
      sessions.length > 0 ? sessions : "데이터 없음"
    );
  }

  // 4. profiles 테이블 확인
  console.log("\n4. profiles 테이블 확인:");
  const { data: profiles, error: profilesError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId);

  if (profilesError) {
    console.log("❌ profiles 테이블 오류:", profilesError.message);
  } else {
    console.log(
      "✅ profiles 테이블 결과:",
      profiles.length > 0 ? profiles : "데이터 없음"
    );
  }

  // 5. 삭제 함수 테스트
  console.log("\n=== 삭제 함수 테스트 ===");

  try {
    const { data, error } = await supabase.rpc("delete_user_by_email", {
      user_email: userEmail,
    });

    if (error) {
      console.log("❌ delete_user_by_email 오류:", error.message);
    } else {
      console.log("✅ delete_user_by_email 결과:", data);
    }
  } catch (err) {
    console.log("❌ delete_user_by_email 예외:", err.message);
  }

  // 6. 삭제 후 다시 확인
  console.log("\n=== 삭제 후 재확인 ===");
  const { data: usersAfter, error: usersAfterError } = await supabase
    .from("users")
    .select("*")
    .eq("email", userEmail);

  if (usersAfterError) {
    console.log("❌ 삭제 후 users 테이블 오류:", usersAfterError.message);
  } else {
    console.log(
      "✅ 삭제 후 users 테이블:",
      usersAfter.length > 0 ? usersAfter : "데이터 없음 (삭제 성공)"
    );
  }
}

checkCurrentUser()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ 스크립트 실행 오류:", error);
    process.exit(1);
  });
