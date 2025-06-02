// 사용자 검증 스키마(zod) 파일입니다.
// 닉네임 등 필수 입력 검증
import { z } from 'zod';

export const userSchema = z.object({
  username: z.string().min(2, '닉네임은 2자 이상 입력해 주세요.').max(20, '닉네임은 20자 이하로 입력해 주세요.'),
  full_name: z.string().optional(),
  preferred_language: z.string().optional(),
}); 