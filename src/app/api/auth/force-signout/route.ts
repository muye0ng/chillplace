import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// 모든 세션과 계정 강제 정리
export async function POST() {
  try {
    console.log('🧹 강제 로그아웃 및 데이터 정리 시작...');
    
    // 1. 모든 세션 삭제
    const { error: sessionsError } = await supabase
      .from('sessions')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // 모든 세션 삭제
    
    if (sessionsError) {
      console.log('⚠️ 세션 삭제 오류:', sessionsError.message);
    } else {
      console.log('✅ 모든 세션 삭제 완료');
    }
    
    // 2. 모든 계정 삭제
    const { error: accountsError } = await supabase
      .from('accounts')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // 모든 계정 삭제
    
    if (accountsError) {
      console.log('⚠️ 계정 삭제 오류:', accountsError.message);
    } else {
      console.log('✅ 모든 계정 삭제 완료');
    }
    
    // 3. 모든 사용자 삭제
    const { error: usersError } = await supabase
      .from('users')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // 모든 사용자 삭제
    
    if (usersError) {
      console.log('⚠️ 사용자 삭제 오류:', usersError.message);
    } else {
      console.log('✅ 모든 사용자 삭제 완료');
    }
    
    // 4. 정리 후 상태 확인
    const { data: remainingUsers } = await supabase.from('users').select('*');
    const { data: remainingAccounts } = await supabase.from('accounts').select('*');
    const { data: remainingSessions } = await supabase.from('sessions').select('*');
    
    console.log('📊 정리 후 상태:');
    console.log('- 남은 사용자:', remainingUsers?.length || 0);
    console.log('- 남은 계정:', remainingAccounts?.length || 0);
    console.log('- 남은 세션:', remainingSessions?.length || 0);
    
    return NextResponse.json({
      success: true,
      message: '모든 인증 데이터 정리 완료',
      cleared: {
        users: remainingUsers?.length === 0,
        accounts: remainingAccounts?.length === 0,
        sessions: remainingSessions?.length === 0
      }
    });

  } catch (error: unknown) {
    console.error('❌ 강제 정리 오류:', error);
    
    const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류'
    
    return NextResponse.json(
      { 
        error: '강제 정리 중 오류가 발생했습니다',
        details: errorMessage 
      },
      { status: 500 }
    )
  }
} 