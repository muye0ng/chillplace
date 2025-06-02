// 알림(Notification) 관련 Supabase 쿼리 함수 모음
import { supabase } from './client';
import type { Notification } from '@/types/database';

// 내 알림 목록 조회
export async function fetchNotifications(userId: string) {
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  return { data: data as Notification[] | null, error };
}

// 알림 생성
export async function createNotification(userId: string, type: string, message: string, url?: string) {
  const { data, error } = await supabase
    .from('notifications')
    .insert([{ user_id: userId, type, message, url, is_read: false }])
    .select()
    .single();
  return { data: data as Notification | null, error };
}

// 알림 읽음 처리
export async function markNotificationRead(notificationId: string) {
  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('id', notificationId);
  return { error };
}

// 알림 삭제
export async function deleteNotification(notificationId: string) {
  const { error } = await supabase
    .from('notifications')
    .delete()
    .eq('id', notificationId);
  return { error };
} 