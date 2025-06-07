const { createClient } = require("@supabase/supabase-js");
require("dotenv").config();

// 서비스 역할 키로 클라이언트 생성
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function directCheck() {
  console.log("=== next_auth 스키마 직접 확인 ===");

  // 1. next_auth 스키마 존재 확인
  try {
    console.log("\n1. 스키마들 확인:");
    const { data, error } = await supabase
      .from("information_schema.schemata")
      .select("schema_name")
      .neq("schema_name", "information_schema")
      .not("schema_name", "like", "pg_%");

    if (error) {
      console.log("❌ 스키마 조회 오류:", error.message);
    } else {
      console.log("📊 사용 가능한 스키마들:");
      data.forEach((schema, index) => {
        console.log(`${index + 1}. ${schema.schema_name}`);
      });
    }
  } catch (err) {
    console.log("❌ 스키마 확인 예외:", err.message);
  }

  // 2. 강제로 next_auth 테이블 조회 시도
  console.log("\n2. next_auth 테이블들 직접 조회 시도:");

  // users 테이블
  try {
    console.log("\n2-1. next_auth.users:");
    const { data: users, error: usersError } = await supabase
      .schema("next_auth")
      .from("users")
      .select("*");

    if (usersError) {
      console.log("❌ next_auth.users 오류:", usersError.message);
    } else {
      console.log("✅ next_auth.users 데이터:", users.length, "개");
      users.forEach((user, index) => {
        console.log(`${index + 1}. ID: ${user.id}, 이메일: ${user.email}`);
      });

      // 특정 사용자 ID 삭제
      if (users.some((u) => u.id === "9a88ed8d-f9b1-48e6-9e0d-32b97e5456dd")) {
        console.log("\n🧹 문제의 사용자 삭제 중...");
        const { error: deleteError } = await supabase
          .schema("next_auth")
          .from("users")
          .delete()
          .eq("id", "9a88ed8d-f9b1-48e6-9e0d-32b97e5456dd");

        if (deleteError) {
          console.log("❌ 사용자 삭제 오류:", deleteError.message);
        } else {
          console.log("✅ 문제의 사용자 삭제 완료");
        }
      }
    }
  } catch (err) {
    console.log("❌ next_auth.users 접근 예외:", err.message);
  }

  // accounts 테이블
  try {
    console.log("\n2-2. next_auth.accounts:");
    const { data: accounts, error: accountsError } = await supabase
      .schema("next_auth")
      .from("accounts")
      .select("*");

    if (accountsError) {
      console.log("❌ next_auth.accounts 오류:", accountsError.message);
    } else {
      console.log("✅ next_auth.accounts 데이터:", accounts.length, "개");
      accounts.forEach((account, index) => {
        console.log(
          `${index + 1}. 사용자 ID: ${
            account.userId || account.user_id
          }, 프로바이더: ${account.provider}`
        );
      });

      // 특정 사용자 계정 삭제
      if (
        accounts.some(
          (a) =>
            (a.userId || a.user_id) === "9a88ed8d-f9b1-48e6-9e0d-32b97e5456dd"
        )
      ) {
        console.log("\n🧹 문제의 계정 삭제 중...");
        const { error: deleteError } = await supabase
          .schema("next_auth")
          .from("accounts")
          .delete()
          .or(
            "userId.eq.9a88ed8d-f9b1-48e6-9e0d-32b97e5456dd,user_id.eq.9a88ed8d-f9b1-48e6-9e0d-32b97e5456dd"
          );

        if (deleteError) {
          console.log("❌ 계정 삭제 오류:", deleteError.message);
        } else {
          console.log("✅ 문제의 계정 삭제 완료");
        }
      }
    }
  } catch (err) {
    console.log("❌ next_auth.accounts 접근 예외:", err.message);
  }

  // sessions 테이블
  try {
    console.log("\n2-3. next_auth.sessions:");
    const { data: sessions, error: sessionsError } = await supabase
      .schema("next_auth")
      .from("sessions")
      .select("*");

    if (sessionsError) {
      console.log("❌ next_auth.sessions 오류:", sessionsError.message);
    } else {
      console.log("✅ next_auth.sessions 데이터:", sessions.length, "개");

      // 특정 사용자 세션 삭제
      if (
        sessions.some(
          (s) =>
            (s.userId || s.user_id) === "9a88ed8d-f9b1-48e6-9e0d-32b97e5456dd"
        )
      ) {
        console.log("\n🧹 문제의 세션 삭제 중...");
        const { error: deleteError } = await supabase
          .schema("next_auth")
          .from("sessions")
          .delete()
          .or(
            "userId.eq.9a88ed8d-f9b1-48e6-9e0d-32b97e5456dd,user_id.eq.9a88ed8d-f9b1-48e6-9e0d-32b97e5456dd"
          );

        if (deleteError) {
          console.log("❌ 세션 삭제 오류:", deleteError.message);
        } else {
          console.log("✅ 문제의 세션 삭제 완료");
        }
      }
    }
  } catch (err) {
    console.log("❌ next_auth.sessions 접근 예외:", err.message);
  }
}

directCheck()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ 직접 확인 오류:", error);
    process.exit(1);
  });
