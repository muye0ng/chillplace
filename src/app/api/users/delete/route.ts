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
    
    // 1. 모든 소셜 계정 연결 해제
    if (userId) {
      try {
        console.log('🔍 사용자 ID로 OAuth 계정 정보 조회 중:', userId);
        
        // NextAuth 계정 정보에서 모든 OAuth 제공자 확인 (next_auth 스키마)
        let { data: userAccounts, error: accountsError } = await supabase
          .schema('next_auth')
          .from('accounts')
          .select('provider, access_token, refresh_token, providerAccountId')
          .eq('userId', userId);

        console.log('📊 next_auth 스키마에서 조회된 계정 정보:', {
          accountsCount: userAccounts?.length || 0,
          accounts: userAccounts,
          error: accountsError
        });

        // next_auth 스키마에서 못 찾았으면 public 스키마에서도 시도
        if ((!userAccounts || userAccounts.length === 0) && !accountsError) {
          console.log('🔄 public 스키마에서도 계정 정보 조회 시도...');
          
          const { data: publicAccounts, error: publicError } = await supabase
            .from('accounts')
            .select('provider, access_token, refresh_token, providerAccountId')
            .eq('userId', userId);
            
          console.log('📊 public 스키마에서 조회된 계정 정보:', {
            accountsCount: publicAccounts?.length || 0,
            accounts: publicAccounts,
            error: publicError
          });
          
          if (publicAccounts && publicAccounts.length > 0) {
            userAccounts = publicAccounts;
            accountsError = publicError;
          }
        }

        if (accountsError) {
          console.error('❌ 계정 정보 조회 오류:', accountsError);
        }

        if (userAccounts && userAccounts.length > 0) {
          console.log('✅ OAuth 계정 발견, 연결 해제 시작...');
          
          for (const account of userAccounts) {
            console.log(`🔗 ${account.provider} 계정 처리 중:`, {
              provider: account.provider,
              hasAccessToken: !!account.access_token,
              hasRefreshToken: !!account.refresh_token,
              providerAccountId: account.providerAccountId
            });
            
            try {
              switch (account.provider) {
                case 'kakao':
                  if (account.access_token) {
                    console.log('🔗 카카오 계정 연결 해제 중...');
                    console.log('📝 카카오 access_token:', account.access_token ? '토큰 있음' : '토큰 없음');
                    
                    let currentAccessToken = account.access_token;
                    
                    try {
                      // 첫 번째 시도: 기존 access_token 사용
                      let kakaoResponse = await fetch('https://kapi.kakao.com/v1/user/unlink', {
                        method: 'POST',
                        headers: {
                          'Authorization': `Bearer ${currentAccessToken}`,
                          'Content-Type': 'application/x-www-form-urlencoded'
                        }
                      });
                      
                      console.log('📊 카카오 API 응답 상태:', kakaoResponse.status);
                      
                      // 토큰 만료 시 refresh_token으로 재시도
                      if (kakaoResponse.status === 401 && account.refresh_token) {
                        console.log('🔄 카카오 토큰 만료 - refresh_token으로 갱신 시도...');
                        
                        try {
                          const refreshResponse = await fetch('https://kauth.kakao.com/oauth/token', {
                            method: 'POST',
                            headers: {
                              'Content-Type': 'application/x-www-form-urlencoded'
                            },
                            body: new URLSearchParams({
                              grant_type: 'refresh_token',
                              client_id: process.env.AUTH_KAKAO_ID!,
                              refresh_token: account.refresh_token
                            })
                          });
                          
                          if (refreshResponse.ok) {
                            const refreshData = await refreshResponse.json();
                            currentAccessToken = refreshData.access_token;
                            console.log('✅ 카카오 토큰 갱신 성공 - Unlink 재시도');
                            
                            // 새 토큰으로 Unlink 재시도
                            kakaoResponse = await fetch('https://kapi.kakao.com/v1/user/unlink', {
                              method: 'POST',
                              headers: {
                                'Authorization': `Bearer ${currentAccessToken}`,
                                'Content-Type': 'application/x-www-form-urlencoded'
                              }
                            });
                          } else {
                            console.log('❌ 카카오 토큰 갱신 실패');
                          }
                        } catch (refreshError) {
                          console.error('💥 카카오 토큰 갱신 오류:', refreshError);
                        }
                      }
                      
                      console.log('📊 카카오 API 최종 응답 상태:', kakaoResponse.status);
                      console.log('📊 카카오 API 응답 헤더:', Object.fromEntries(kakaoResponse.headers.entries()));
                      
                      if (kakaoResponse.ok) {
                        const responseData = await kakaoResponse.json();
                        console.log('✅ 카카오 계정 연결 해제 완료:', responseData);
                      } else {
                        const errorText = await kakaoResponse.text();
                        console.log('❌ 카카오 연결 해제 실패:', {
                          status: kakaoResponse.status,
                          statusText: kakaoResponse.statusText,
                          body: errorText
                        });
                        
                        // 토큰이 만료되었거나 유효하지 않은 경우에도 탈퇴는 진행
                        if (kakaoResponse.status === 401) {
                          console.log('⚠️ 카카오 토큰 만료/무효 - 계속 진행');
                        }
                      }
                    } catch (kakaoError) {
                      console.error('💥 카카오 API 호출 오류:', kakaoError);
                    }
                  } else {
                    console.log('⚠️ 카카오 access_token이 없음 - 연결 해제 건너뜀');
                  }
                  break;

                case 'google':
                  if (account.access_token) {
                    console.log('🔗 구글 계정 연결 해제 중...');
                    const googleResponse = await fetch(`https://accounts.google.com/o/oauth2/revoke?token=${account.access_token}`, {
                      method: 'POST'
                    });
                    
                    if (googleResponse.ok) {
                      console.log('✅ 구글 계정 연결 해제 완료');
                    } else {
                      console.log('⚠️ 구글 연결 해제 실패 (이미 해제되었을 수 있음)');
                    }
                  }
                  break;

                case 'naver':
                  if (account.access_token) {
                    console.log('🔗 네이버 계정 연결 해제 중...');
                    const naverResponse = await fetch('https://nid.naver.com/oauth2.0/token', {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                      },
                      body: new URLSearchParams({
                        grant_type: 'delete',
                        client_id: process.env.AUTH_NAVER_ID!,
                        client_secret: process.env.AUTH_NAVER_SECRET!,
                        access_token: account.access_token
                      })
                    });
                    
                    if (naverResponse.ok) {
                      console.log('✅ 네이버 계정 연결 해제 완료');
                    } else {
                      console.log('⚠️ 네이버 연결 해제 실패 (이미 해제되었을 수 있음)');
                    }
                  }
                  break;

                default:
                  console.log(`⚠️ 알 수 없는 OAuth 제공자: ${account.provider}`);
              }
            } catch (unlinkError) {
              console.log(`⚠️ ${account.provider} 연결 해제 처리 중 오류 (계속 진행):`, unlinkError);
            }
          }
        } else {
          console.log('⚠️ OAuth 계정 정보 없음 - 연결 해제 건너뜀');
        }
      } catch (unlinkError) {
        console.log('⚠️ OAuth 연결 해제 처리 중 오류 (계속 진행):', unlinkError);
      }
    } else {
      console.log('⚠️ 사용자 ID 없음 - OAuth 연결 해제 건너뜀');
    }

    // 2. 데이터베이스에서 사용자 삭제 (public + next_auth 스키마 둘 다)
    const { data, error } = await supabase.rpc('delete_user_by_email', {
      user_email: session.user.email
    })
    
    if (error) throw error

    console.log('🗑️ 완전한 회원탈퇴 처리 완료:', data)

    return NextResponse.json({
      success: true,
      message: data,
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