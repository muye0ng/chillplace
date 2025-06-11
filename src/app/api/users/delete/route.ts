import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { createClient } from '@supabase/supabase-js'
import { authOptions } from '@/lib/auth'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// API 정보 조회 (브라우저 테스트용)
export async function GET(request: NextRequest) {
  try {
    console.log('🔍 API GET - 요청 헤더:', {
      cookies: request.headers.get('cookie'),
      userAgent: request.headers.get('user-agent'),
      host: request.headers.get('host')
    });
    
    const session = await getServerSession(authOptions)
    console.log('🔍 API GET - Session:', session);
    
    // 쿠키 직접 확인
    const cookies = request.headers.get('cookie') || '';
    const sessionToken = cookies.split(';')
      .find(c => c.trim().startsWith('next-auth.session-token=') || c.trim().startsWith('__Secure-next-auth.session-token='))
      ?.split('=')[1];
    
    console.log('🍪 세션 토큰:', sessionToken ? '있음' : '없음');
    
    return NextResponse.json({
      message: '회원 삭제 API',
      status: 'active',
      currentUser: session?.user?.email || 'not logged in',
      sessionData: session ? {
        userId: (session.user as { id?: string })?.id,
        userName: session.user?.name,
        userEmail: session.user?.email
      } : null,
      cookies: {
        hasSessionToken: !!sessionToken,
        cookieCount: cookies.split(';').length
      },
      methods: {
        POST: '본인 계정 삭제 (confirmText: "회원탈퇴" 필요)',
        DELETE: '특정 사용자 삭제 (userId 또는 userEmail 필요)'
      },
      example: {
        selfDelete: {
          method: 'POST',
          body: { confirmText: '회원탈퇴' }
        },
        adminDelete: {
          method: 'DELETE', 
          body: { userEmail: 'user@example.com' }
        }
      }
    })
  } catch (error: unknown) {
    console.error('❌ API GET 오류:', error);
    const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류'
    
    return NextResponse.json(
      { 
        error: 'API 정보 조회 중 오류 발생',
        details: errorMessage 
      },
      { status: 500 }
    )
  }
}

// 사용자 완전 삭제 API
export async function DELETE(request: NextRequest) {
  try {
    // 현재 세션 확인
    const session = await getServerSession(authOptions)
    console.log('🔍 API DELETE - Session:', session);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: '로그인이 필요합니다' },
        { status: 401 }
      )
    }

    // 요청 본문에서 삭제할 사용자 정보 가져오기
    const body = await request.json()
    const { userId, userEmail } = body

    // 본인 확인 (현재 로그인한 사용자와 일치하는지)
    if (userEmail && session.user.email !== userEmail) {
      return NextResponse.json(
        { error: '본인의 계정만 삭제할 수 있습니다' },
        { status: 403 }
      )
    }

    // 삭제 실행
    let result
    if (userId) {
      // UUID로 삭제
      const { data, error } = await supabase.rpc('delete_user_completely', {
        user_id_input: userId
      })
      
      if (error) throw error
      result = data
    } else if (userEmail) {
      // 이메일로 삭제
      const { data, error } = await supabase.rpc('delete_user_by_email', {
        user_email: userEmail
      })
      
      if (error) throw error
      result = data
    } else {
      return NextResponse.json(
        { error: '사용자 ID 또는 이메일이 필요합니다' },
        { status: 400 }
      )
    }

    console.log('🗑️ 사용자 삭제 결과:', result)

    return NextResponse.json({
      success: true,
      message: result,
      deletedUser: userEmail || userId
    })

  } catch (error: unknown) {
    console.error('❌ 사용자 삭제 오류:', error)
    
    const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류'
    
    return NextResponse.json(
      { 
        error: '사용자 삭제 중 오류가 발생했습니다',
        details: errorMessage 
      },
      { status: 500 }
    )
  }
}

// 현재 사용자 자신을 삭제하는 간편 API
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    console.log('🔍 API POST - Session:', session);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: '로그인이 필요합니다' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { confirmText } = body

    // 확인 텍스트 검증
    if (confirmText !== '회원탈퇴') {
      return NextResponse.json(
        { error: '"회원탈퇴"를 정확히 입력해주세요' },
        { status: 400 }
      )
    }

    const userId = (session.user as { id?: string })?.id;
    
    // 1. 계정 정보 삭제
    const { error: accountError } = await supabase
      .schema('next_auth')
      .from('accounts')
      .delete()
      .eq('userId', userId);

    if (accountError) {
      console.error('❌ 계정 정보 삭제 실패:', accountError);
      return NextResponse.json(
        { message: '계정 정보 삭제 중 오류가 발생했습니다.' },
        { status: 500 }
      );
    }

    // 2. 사용자 정보 삭제
    const { error: userError } = await supabase
      .schema('next_auth')
      .from('users')
      .delete()
      .eq('id', userId);

    if (userError) {
      console.error('❌ 회원탈퇴 처리 오류:', userError);
      return NextResponse.json(
        { message: '회원탈퇴 처리 중 오류가 발생했습니다.' },
        { status: 500 }
      );
    }

    // 3. 프로필 정보 삭제
    const { error: profileError } = await supabase
      .from('profiles')
      .delete()
      .eq('id', userId);

    if (profileError) {
      console.error('❌ 프로필 삭제 실패:', profileError);
      return NextResponse.json(
        { message: '프로필 삭제 중 오류가 발생했습니다.' },
        { status: 500 }
      );
    }

    // 4. 동의 정보 삭제
    const { error: consentError } = await supabase
      .from('consents')
      .delete()
      .eq('email', session.user.email);

    if (consentError) {
      console.error('❌ 동의 정보 삭제 실패:', consentError);
      return NextResponse.json(
        { message: '동의 정보 삭제 중 오류가 발생했습니다.' },
        { status: 500 }
      );
    }

    console.log('🗑️ 완전한 회원탈퇴 처리 완료')

    return NextResponse.json({
      success: true,
      message: '회원탈퇴가 완료되었습니다.',
      deletedUser: session.user.email
    })

  } catch (error: unknown) {
    console.error('❌ 회원탈퇴 처리 오류:', error)
    
    const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류'
    
    return NextResponse.json(
      { 
        error: '회원탈퇴 처리 중 오류가 발생했습니다',
        details: errorMessage 
      },
      { status: 500 }
    )
  }
} 