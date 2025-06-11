const { Client } = require("pg");
require("dotenv").config();

async function checkNextAuthTables() {
  console.log("🔍 next_auth 스키마 테이블 직접 확인");

  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    await client.connect();

    // next_auth.users 테이블 확인
    console.log("\n📊 next_auth.users:");
    const usersResult = await client.query("SELECT * FROM next_auth.users");
    console.log("users 데이터:", usersResult.rows);

    // next_auth.accounts 테이블 확인
    console.log("\n📊 next_auth.accounts:");
    const accountsResult = await client.query(
      "SELECT * FROM next_auth.accounts"
    );
    console.log("accounts 데이터:", accountsResult.rows);

    // next_auth.sessions 테이블 확인
    console.log("\n📊 next_auth.sessions:");
    const sessionsResult = await client.query(
      "SELECT * FROM next_auth.sessions"
    );
    console.log("sessions 데이터:", sessionsResult.rows);

    // public.profiles 테이블 확인
    console.log("\n📊 public.profiles:");
    const profilesResult = await client.query("SELECT * FROM public.profiles");
    console.log("profiles 데이터:", profilesResult.rows);
  } catch (error) {
    console.error("에러:", error);
  } finally {
    await client.end();
  }
}

checkNextAuthTables();
