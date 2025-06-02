// next-pwa 적용을 위한 설정 파일입니다.
// 앱 코드/타입/함수는 절대 포함하지 않습니다.
import withPWA from 'next-pwa';

const nextConfig = {
  // 추가적인 Next.js 설정은 여기에 작성
};

export default withPWA({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
})(nextConfig);
