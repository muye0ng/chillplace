// 리뷰 검증 스키마(zod) 파일입니다.
// 50자 제한, 필수 입력 등 검증
import { z } from 'zod';

export const reviewSchema = z.object({
  content: z.string().min(1, '리뷰를 입력해 주세요.').max(50, '최대 50자까지 입력 가능합니다.'),
  image: z.any().optional(),
}); 