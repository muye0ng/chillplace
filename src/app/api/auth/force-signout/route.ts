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
    
    // 1. 사용자 정보 조회
    const { data: userData, error: userError } = await supabase
      .schema('next_auth')
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (userError) {
      console.error('사용자 정보 조회 실패:', userError);
      return NextResponse.json(
        { message: '사용자 정보를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 2. 계정 정보 삭제
    const { error: accountError } = await supabase
      .schema('next_auth')
      .from('accounts')
      .delete()
      .eq('userId', userData.id);

    if (accountError) {
      console.error('계정 정보 삭제 실패:', accountError);
      return NextResponse.json(
        { message: '계정 정보 삭제 중 오류가 발생했습니다.' },
        { status: 500 }
      );
    }

    // 3. 사용자 정보 삭제
    const { error: userDeleteError } = await supabase
      .schema('next_auth')
      .from('users')
      .delete()
      .eq('id', userData.id);

    if (userDeleteError) {
      console.error('사용자 정보 삭제 실패:', userDeleteError);
      return NextResponse.json(
        { message: '사용자 정보 삭제 중 오류가 발생했습니다.' },
        { status: 500 }
      );
    }
    
    // 4. 정리 후 상태 확인
    const { data: remainingUsers } = await supabase
      .schema('next_auth')
      .from('users')
      .select('*');

    const { data: remainingAccounts } = await supabase
      .schema('next_auth')
      .from('accounts')
      .select('*');
    
    console.log('📊 정리 후 상태:');
    console.log('- 남은 사용자:', remainingUsers?.length || 0);
    console.log('- 남은 계정:', remainingAccounts?.length || 0);
    
    return NextResponse.json({
      success: true,
      message: '모든 인증 데이터 정리 완료',
      cleared: {
        users: remainingUsers?.length === 0,
        accounts: remainingAccounts?.length === 0
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