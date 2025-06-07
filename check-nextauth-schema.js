const { createClient } = require("@supabase/supabase-js");
require("dotenv").config();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkNextAuthSchema() {
  console.log("=== next_auth 스키마 확인 및 정리 ===");

  // 1. next_auth.users 테이블 확인
  console.log("\n1. next_auth.users 테이블 확인:");
  try {
    const { data: nextAuthUsers, error: usersError } = await supabase
      .from("next_auth.users")
      .select("*");

    if (usersError) {
      console.log("❌ next_auth.users 테이블 오류:", usersError.message);

      // 다른 방법으로 시도
      const { data: rawUsers, error: rawUsersError } = await supabase.rpc(
        "get_nextauth_users"
      );

      if (rawUsersError) {
        console.log("❌ RPC 호출도 실패:", rawUsersError.message);
      } else {
        console.log("✅ RPC로 next_auth.users:", rawUsers);
      }
    } else {
      console.log("📊 next_auth.users 데이터:");
      nextAuthUsers.forEach((user, index) => {
        console.log(`${index + 1}. ID: ${user.id}, 이메일: ${user.email}`);
      });

      if (nextAuthUsers.length > 0) {
        console.log("\n🧹 next_auth.users 데이터 삭제 중...");
        const { error: deleteUsersError } = await supabase
          .from("next_auth.users")
          .delete()
          .neq("id", "00000000-0000-0000-0000-000000000000");

        if (deleteUsersError) {
          console.log(
            "❌ next_auth.users 삭제 오류:",
            deleteUsersError.message
          );
        } else {
          console.log("✅ next_auth.users 삭제 완료");
        }
      }
    }
  } catch (err) {
    console.log("❌ next_auth.users 접근 예외:", err.message);
  }

  // 2. next_auth.accounts 테이블 확인
  console.log("\n2. next_auth.accounts 테이블 확인:");
  try {
    const { data: nextAuthAccounts, error: accountsError } = await supabase
      .from("next_auth.accounts")
      .select("*");

    if (accountsError) {
      console.log("❌ next_auth.accounts 테이블 오류:", accountsError.message);
    } else {
      console.log("📊 next_auth.accounts 데이터:");
      nextAuthAccounts.forEach((account, index) => {
        console.log(
          `${index + 1}. 사용자 ID: ${account.userId}, 프로바이더: ${
            account.provider
          }`
        );
      });

      if (nextAuthAccounts.length > 0) {
        console.log("\n🧹 next_auth.accounts 데이터 삭제 중...");
        const { error: deleteAccountsError } = await supabase
          .from("next_auth.accounts")
          .delete()
          .neq("id", "00000000-0000-0000-0000-000000000000");

        if (deleteAccountsError) {
          console.log(
            "❌ next_auth.accounts 삭제 오류:",
            deleteAccountsError.message
          );
        } else {
          console.log("✅ next_auth.accounts 삭제 완료");
        }
      }
    }
  } catch (err) {
    console.log("❌ next_auth.accounts 접근 예외:", err.message);
  }

  // 3. next_auth.sessions 테이블도 확인
  console.log("\n3. next_auth.sessions 테이블 확인:");
  try {
    const { data: nextAuthSessions, error: sessionsError } = await supabase
      .from("next_auth.sessions")
      .select("*");

    if (sessionsError) {
      console.log("❌ next_auth.sessions 테이블 오류:", sessionsError.message);
    } else {
      console.log(
        "📊 next_auth.sessions 데이터:",
        nextAuthSessions.length,
        "개"
      );

      if (nextAuthSessions.length > 0) {
        console.log("\n🧹 next_auth.sessions 데이터 삭제 중...");
        const { error: deleteSessionsError } = await supabase
          .from("next_auth.sessions")
          .delete()
          .neq("id", "00000000-0000-0000-0000-000000000000");

        if (deleteSessionsError) {
          console.log(
            "❌ next_auth.sessions 삭제 오류:",
            deleteSessionsError.message
          );
        } else {
          console.log("✅ next_auth.sessions 삭제 완료");
        }
      }
    }
  } catch (err) {
    console.log("❌ next_auth.sessions 접근 예외:", err.message);
  }

  // 4. SQL 쿼리로 직접 확인 시도
  console.log("\n=== SQL 쿼리로 next_auth 스키마 확인 ===");
  try {
    const { data: sqlResult, error: sqlError } = await supabase.rpc(
      "check_nextauth_schema"
    );

    if (sqlError) {
      console.log("❌ SQL 확인 실패:", sqlError.message);
    } else {
      console.log("✅ SQL 결과:", sqlResult);
    }
  } catch (err) {
    console.log("❌ SQL 실행 예외:", err.message);
  }
}

checkNextAuthSchema()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ next_auth 스키마 확인 오류:", error);
    process.exit(1);
  });
