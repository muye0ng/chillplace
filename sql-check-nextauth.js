const { createClient } = require("@supabase/supabase-js");
require("dotenv").config();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkNextAuthWithSQL() {
  console.log("=== SQL로 next_auth 스키마 확인 ===");

  try {
    // 1. 스키마 존재 여부 확인
    console.log("\n1. next_auth 스키마 존재 확인:");
    const { data: schemas, error: schemaError } = await supabase.rpc("sql", {
      query: `
          SELECT schema_name 
          FROM information_schema.schemata 
          WHERE schema_name = 'next_auth';
        `,
    });

    if (schemaError) {
      console.log("❌ 스키마 확인 오류:", schemaError.message);

      // 대안: 모든 스키마 조회
      console.log("\n🔍 모든 스키마 조회:");
      const { data: allSchemas, error: allSchemaError } = await supabase.rpc(
        "sql",
        {
          query: `SELECT schema_name FROM information_schema.schemata WHERE schema_name NOT LIKE 'pg_%' AND schema_name != 'information_schema';`,
        }
      );

      if (allSchemaError) {
        console.log("❌ 전체 스키마 조회 오류:", allSchemaError.message);
      } else {
        console.log("📊 사용 가능한 스키마들:");
        allSchemas.forEach((schema, index) => {
          console.log(`${index + 1}. ${schema.schema_name}`);
        });
      }
    } else {
      console.log(
        "✅ next_auth 스키마 존재:",
        schemas.length > 0 ? "예" : "아니오"
      );
    }

    // 2. next_auth 테이블들 확인
    if (schemas && schemas.length > 0) {
      console.log("\n2. next_auth 스키마의 테이블들 확인:");
      const { data: tables, error: tableError } = await supabase.rpc("sql", {
        query: `
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'next_auth';
          `,
      });

      if (tableError) {
        console.log("❌ 테이블 확인 오류:", tableError.message);
      } else {
        console.log("📊 next_auth 스키마의 테이블들:");
        tables.forEach((table, index) => {
          console.log(`${index + 1}. ${table.table_name}`);
        });

        // 3. users 테이블 데이터 확인
        console.log("\n3. next_auth.users 테이블 데이터:");
        const { data: users, error: usersError } = await supabase.rpc("sql", {
          query: `SELECT * FROM next_auth.users;`,
        });

        if (usersError) {
          console.log("❌ users 조회 오류:", usersError.message);
        } else {
          console.log("📊 next_auth.users 데이터:", users.length, "개");
          users.forEach((user, index) => {
            console.log(`${index + 1}. ID: ${user.id}, 이메일: ${user.email}`);
          });

          // 사용자 데이터 삭제
          if (users.length > 0) {
            console.log("\n🧹 next_auth.users 데이터 삭제 중...");
            const { error: deleteUsersError } = await supabase.rpc("sql", {
              query: `DELETE FROM next_auth.users;`,
            });

            if (deleteUsersError) {
              console.log("❌ users 삭제 오류:", deleteUsersError.message);
            } else {
              console.log("✅ next_auth.users 삭제 완료");
            }
          }
        }

        // 4. accounts 테이블 데이터 확인
        console.log("\n4. next_auth.accounts 테이블 데이터:");
        const { data: accounts, error: accountsError } = await supabase.rpc(
          "sql",
          {
            query: `SELECT * FROM next_auth.accounts;`,
          }
        );

        if (accountsError) {
          console.log("❌ accounts 조회 오류:", accountsError.message);
        } else {
          console.log("📊 next_auth.accounts 데이터:", accounts.length, "개");
          accounts.forEach((account, index) => {
            console.log(
              `${index + 1}. 사용자 ID: ${
                account.userId || account.user_id
              }, 프로바이더: ${account.provider}`
            );
          });

          // 계정 데이터 삭제
          if (accounts.length > 0) {
            console.log("\n🧹 next_auth.accounts 데이터 삭제 중...");
            const { error: deleteAccountsError } = await supabase.rpc("sql", {
              query: `DELETE FROM next_auth.accounts;`,
            });

            if (deleteAccountsError) {
              console.log(
                "❌ accounts 삭제 오류:",
                deleteAccountsError.message
              );
            } else {
              console.log("✅ next_auth.accounts 삭제 완료");
            }
          }
        }

        // 5. sessions 테이블 데이터 확인
        console.log("\n5. next_auth.sessions 테이블 데이터:");
        const { data: sessions, error: sessionsError } = await supabase.rpc(
          "sql",
          {
            query: `SELECT * FROM next_auth.sessions;`,
          }
        );

        if (sessionsError) {
          console.log("❌ sessions 조회 오류:", sessionsError.message);
        } else {
          console.log("📊 next_auth.sessions 데이터:", sessions.length, "개");

          // 세션 데이터 삭제
          if (sessions.length > 0) {
            console.log("\n🧹 next_auth.sessions 데이터 삭제 중...");
            const { error: deleteSessionsError } = await supabase.rpc("sql", {
              query: `DELETE FROM next_auth.sessions;`,
            });

            if (deleteSessionsError) {
              console.log(
                "❌ sessions 삭제 오류:",
                deleteSessionsError.message
              );
            } else {
              console.log("✅ next_auth.sessions 삭제 완료");
            }
          }
        }
      }
    }
  } catch (err) {
    console.log("❌ SQL 실행 예외:", err.message);
  }
}

checkNextAuthWithSQL()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ SQL 확인 오류:", error);
    process.exit(1);
  });
