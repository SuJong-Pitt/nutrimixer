// ============================================================
// Nutri-Mixer - Core TypeScript Type Definitions
// ============================================================

/**
 * 복용 권장 시간
 */
export type DosageTime = "before_meal" | "after_meal" | "any_time" | "morning" | "evening";

/**
 * 궁합 유형
 * - SYNERGY: 시너지 효과 (함께 먹으면 더 효과적)
 * - CAUTION: 주의 필요 (시간 간격을 두고 섭취 권장)
 * - CONFLICT: 충돌 (함께 섭취하면 효과 방해 또는 부작용)
 */
export type InteractionType = "SYNERGY" | "CAUTION" | "CONFLICT";

/**
 * 영양제 카테고리
 */
export type IngredientCategory =
  | "vitamins"
  | "minerals"
  | "omega"
  | "probiotics"
  | "herbs"
  | "amino_acids"
  | "antioxidants"
  | "hormones"
  | "enzymes"
  | "drugs"
  | "lipids"
  | "other";

/**
 * 영양제 성분 (Ingredient)
 * Supabase `ingredients` 테이블과 매핑
 */
export interface Ingredient {
  id: string; // UUID
  name: string; // 한국어 이름 (e.g. '비타민C')
  name_en: string; // 영문 이름 (e.g. 'Vitamin C')
  slug: string; // URL-friendly 식별자 (e.g. 'vitamin-c')
  category: IngredientCategory;
  description: string; // 성분 상세 설명
  short_description: string; // 카드에 표시할 한 줄 설명
  dosage_time: DosageTime; // 권장 복용 시간
  dosage_note: string | null; // 복용량/방법 메모
  icon_emoji: string; // 대표 이모지 (e.g. '🍊')
  benefits: string[]; // 주요 효능 목록
  warnings: string[] | null; // 주의사항 목록
  coupang_search_keyword: string; // 쿠팡 파트너스 검색 키워드
  is_popular: boolean; // 인기 성분 여부 (홈 화면 우선 노출)
  sort_order: number; // 정렬 순서
  created_at: string; // ISO 8601
  updated_at: string; // ISO 8601
}

/**
 * 두 성분 간의 궁합 정보 (Interaction)
 * Supabase `interactions` 테이블과 매핑
 * ingredient_a_id < ingredient_b_id 순서로 저장하여 중복 방지
 */
export interface Interaction {
  id: string; // UUID
  ingredient_a_id: string; // UUID (FK → ingredients.id)
  ingredient_b_id: string; // UUID (FK → ingredients.id)
  type: InteractionType; // 궁합 유형
  title: string; // 궁합 요약 제목 (e.g. '흡수율 2배 상승!')
  reason: string; // 전문적인 궁합 이유 설명
  recommendation: string | null; // 구체적인 복용 권장 방법
  scientific_reference: string | null; // 근거 논문/출처 (선택)
  created_at: string;
  updated_at: string;
  // JOIN 시 추가되는 성분 정보 (API 응답용)
  ingredient_a?: Ingredient;
  ingredient_b?: Ingredient;
}

/**
 * 분석 결과 - 쌍(pair)별 궁합 요약
 */
export interface InteractionResult {
  pair: [Ingredient, Ingredient];
  interaction: Interaction | null; // null = 데이터 없음 (중립)
}

/**
 * 전체 분석 결과
 */
export interface AnalysisResult {
  ingredients: Ingredient[];
  synergies: InteractionResult[]; // SYNERGY 궁합
  cautions: InteractionResult[]; // CAUTION 궁합
  conflicts: InteractionResult[]; // CONFLICT 궁합
  score: number; // 전체 궁합 점수 0~100
  summary: string; // AI 생성 종합 요약
  analyzed_at: string; // 분석 시각 ISO 8601
}

/**
 * 쿠팡 파트너스 상품 placeholder 타입
 */
export interface CoupangProduct {
  product_id: string;
  name: string;
  price: number;
  original_price: number | null;
  discount_rate: number | null;
  image_url: string;
  product_url: string; // 쿠팡 파트너스 어필리에이트 링크
  is_rocket: boolean; // 로켓배송 여부
  rating: number | null; // 평점 0~5
  review_count: number | null;
}

/**
 * 쿠팡 파트너스 응답 wrapping
 */
export interface CoupangAffiliateSlot {
  ingredient_name: string;
  search_keyword: string;
  products: CoupangProduct[];
}

// ============================================================
// API 요청/응답 타입
// ============================================================

export interface AnalyzeRequestPayload {
  ingredient_ids: string[];
}

export interface AnalyzeResponsePayload {
  success: boolean;
  data: AnalysisResult | null;
  error?: string;
}

// ============================================================
// Supabase Database 스키마 타입 (supabase-js 호환)
// ============================================================

export type Database = {
  public: {
    Tables: {
      ingredients: {
        Row: Ingredient;
        Insert: Omit<Ingredient, "id" | "created_at" | "updated_at">;
        Update: Partial<Omit<Ingredient, "id" | "created_at" | "updated_at">>;
      };
      interactions: {
        Row: Omit<Interaction, "ingredient_a" | "ingredient_b">;
        Insert: Omit<
          Interaction,
          "id" | "created_at" | "updated_at" | "ingredient_a" | "ingredient_b"
        >;
        Update: Partial<
          Omit<Interaction, "id" | "created_at" | "updated_at" | "ingredient_a" | "ingredient_b">
        >;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
  };
};
