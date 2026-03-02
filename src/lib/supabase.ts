import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
        "Missing Supabase environment variables. Check NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY"
    );
}

/**
 * Supabase 클라이언트 싱글톤
 * - Database 제네릭으로 완전한 타입 추론 지원
 */
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

/**
 * 서버 컴포넌트용 Supabase 클라이언트 팩토리
 * (서버 컴포넌트에서 매번 새 인스턴스 생성)
 */
export function createServerClient() {
    return createClient<Database>(supabaseUrl, supabaseAnonKey);
}
