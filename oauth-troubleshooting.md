# OAuth 동의 화면 문제 해결 가이드

## 현재 상황
- ✅ Google: 동의 화면 정상 표시 (`prompt: "consent"`)
- ✅ 네이버: 동의 화면 정상 표시 (`auth_type: "reprompt"`)
- ❌ 카카오: 동의 화면 표시 안됨

## 카카오 OAuth 동의 화면 문제 해결

### 1. 카카오 개발자 콘솔 설정 확인
**URL**: https://developers.kakao.com

#### 필수 설정 단계:
1. **내 애플리케이션** → 해당 앱 선택
2. **제품 설정** → **카카오 로그인** 
3. **동의항목** 설정:
   - **닉네임**: ✅ 필수 동의
   - **프로필 사진**: ✅ 필수 동의  
   - **카카오계정(이메일)**: ✅ 필수 동의

### 2. 현재 코드 설정
```javascript
authorization: {
  url: "https://kauth.kakao.com/oauth/authorize",
  params: {
    scope: "account_email profile_nickname profile_image",
    response_type: "code",
    through_account: "true"  // 동의 화면 강제 표시
  },
}
```

### 3. 추가 시도할 수 있는 파라미터들
- `prompt: "login"` (재로그인 강제)
- `approval_prompt: "force"` (동의 강제)
- `state` 파라미터 추가

## Google OAuth 참고 사항
Google 공식 문서에 따르면:
- `prompt=consent`: 항상 동의 화면 표시
- OAuth 동의 화면은 앱의 프로젝트 세부정보와 정책을 정의
- 스코프는 가능한 한 좁게 설정하는 것이 권장됨

## 네이버 OAuth 참고 사항
- `auth_type: "reprompt"`: 재인증 및 동의 강제

## 문제 해결 우선순위
1. **카카오 개발자 콘솔 동의항목 설정** (가장 중요)
2. OAuth 파라미터 조정
3. 테스트 사용자 추가 (개발 단계)

## 테스트 방법
1. 브라우저 시크릿 모드에서 테스트
2. 카카오 계정에서 연결된 앱 해제 후 재테스트
3. 다른 카카오 계정으로 테스트 