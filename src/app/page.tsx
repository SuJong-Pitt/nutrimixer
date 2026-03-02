"use client";

import { useRef, useState, useEffect } from "react";
import { Search, Pill, ChevronDown, Info, Sparkles } from "lucide-react";
import { Input } from "@/components/ui/input";
import IngredientCard from "@/components/IngredientCard";
import FloatingBasketBar from "@/components/FloatingBasketBar";
import AnalyzingAnimation from "@/components/AnalyzingAnimation";
import AnalysisResults from "@/components/AnalysisResults";
import { useBasketStore } from "@/store/basketStore";
import { supabase } from "@/lib/supabase";
import type { AnalysisResult, Ingredient, InteractionResult } from "@/types/database";
import { cn } from "@/lib/utils";

const CATEGORIES = [
  { key: "all", label: "전체", emoji: "✨" },
  { key: "drugs", label: "의약품", emoji: "💊" },
  { key: "vitamins", label: "비타민", emoji: "💊" },
  { key: "minerals", label: "미네랄", emoji: "⚗️" },
  { key: "omega", label: "오메가", emoji: "🐟" },
  { key: "probiotics", label: "유산균", emoji: "🦠" },
  { key: "antioxidants", label: "항산화", emoji: "🛡️" },
  { key: "amino_acids", label: "아미노산", emoji: "✨" },
  { key: "lipids", label: "지질/인지질", emoji: "🍳" },
  { key: "enzymes", label: "효소", emoji: "🍱" },
  { key: "herbs", label: "허브/천연", emoji: "🌿" },
  { key: "hormones", label: "호르몬", emoji: "🦋" },
  { key: "other", label: "기타", emoji: "🧪" },
] as const;

type CategoryKey = (typeof CATEGORIES)[number]["key"];

export default function HomePage() {
  const resultRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<CategoryKey>("all");
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);

  const [dbIngredients, setDbIngredients] = useState<Ingredient[]>([]);
  const [isLoadingList, setIsLoadingList] = useState(true);

  useEffect(() => {
    const fetchIngredients = async () => {
      setIsLoadingList(true);
      const { data, error } = await supabase
        .from("ingredients")
        .select("*")
        .order("sort_order", { ascending: true });

      if (data) {
        setDbIngredients(data);
      }
      setIsLoadingList(false);
    };
    fetchIngredients();
  }, []);

  const { selectedIngredients, isAnalyzing, hasResult, setAnalyzing, setHasResult } =
    useBasketStore();

  // 필터링 로직
  const filteredIngredients = dbIngredients.filter((ing) => {
    const matchesSearch =
      searchQuery === "" ||
      ing.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ing.name_en.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ing.short_description.includes(searchQuery);

    const matchesCategory =
      selectedCategory === "all" || ing.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const popularIngredients = dbIngredients.filter((i) => i.is_popular);

  /**
   * 분석 실행 (목 데이터 기반)
   * 실제 서비스 시 src/app/api/analyze/route.ts 엔드포인트로 교체
   */
  const handleAnalyze = async () => {
    if (selectedIngredients.length < 2) return;

    setAnalyzing(true);

    // 스크롤 프리뷰
    setTimeout(() => {
      resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);

    // 분석 효과를 제대로 보여주기 위한 딜레이 (4.5초 대기)
    await new Promise((resolve) => setTimeout(resolve, 4500));

    // Supabase에서 선택된 영양제들의 인터랙션 정보 가져오기
    const ingredients = selectedIngredients;
    const ingredientIds = ingredients.map((i) => i.id);

    const { data: dbInteractions } = await supabase
      .from("interactions")
      .select("*")
      .in("ingredient_a_id", ingredientIds)
      .in("ingredient_b_id", ingredientIds);

    const findInteraction = (idA: string, idB: string) => {
      const dbInts = (dbInteractions as any[]) || [];
      return (
        dbInts.find(
          (i) =>
            (i.ingredient_a_id === idA && i.ingredient_b_id === idB) ||
            (i.ingredient_a_id === idB && i.ingredient_b_id === idA)
        ) ?? null
      );
    };

    const synergies: InteractionResult[] = [];
    const cautions: InteractionResult[] = [];
    const conflicts: InteractionResult[] = [];

    for (let i = 0; i < ingredients.length; i++) {
      for (let j = i + 1; j < ingredients.length; j++) {
        const ing1 = ingredients[i];
        const ing2 = ingredients[j];
        const interaction = findInteraction(ing1.id, ing2.id) as any;

        const result: InteractionResult = {
          pair: [ing1, ing2],
          interaction,
        };

        if (!interaction) continue;
        if (interaction.type === "SYNERGY") synergies.push(result);
        else if (interaction.type === "CAUTION") cautions.push(result);
        else if (interaction.type === "CONFLICT") conflicts.push(result);
      }
    }

    // 점수 계산
    const totalPairs = (ingredients.length * (ingredients.length - 1)) / 2;
    const synergyWeight = synergies.length * 15;
    const cautionPenalty = cautions.length * 5;
    const conflictPenalty = conflicts.length * 25;
    const baseScore = 70;
    const score = Math.max(
      10,
      Math.min(100, baseScore + synergyWeight - cautionPenalty - conflictPenalty)
    );

    // 종합 요약
    let summary = "";
    if (conflicts.length > 0) {
      summary = `⚠️ ${conflicts.length}가지 충돌 조합이 발견되었습니다. 함께 복용 시 효과가 감소하거나 부작용이 발생할 수 있습니다.`;
    } else if (synergies.length > 0) {
      summary = `✅ ${synergies.length}가지 시너지 조합이 발견되었습니다! 함께 복용하면 효과가 더욱 극대화됩니다.`;
    } else if (cautions.length > 0) {
      summary = `🔶 ${cautions.length}가지 주의 조합이 있습니다. 복용 시간 간격을 두고 섭취하면 문제없습니다.`;
    } else {
      summary = "선택한 영양제들은 서로 크게 영향을 주지 않는 중립적인 조합입니다. 각각의 효능을 독립적으로 누릴 수 있습니다.";
    }

    const result: AnalysisResult = {
      ingredients,
      synergies,
      cautions,
      conflicts,
      score,
      summary,
      analyzed_at: new Date().toISOString(),
    };

    setAnalysisResult(result);
    setAnalyzing(false);
    setHasResult(true);

    // 결과로 스크롤
    setTimeout(() => {
      resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 200);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ============================================================
       * HERO SECTION
       * ============================================================ */}
      <section className="relative overflow-hidden pb-20 pt-16 md:pt-24 md:pb-32 bg-slate-900 texture-grain">
        {/* 절대경로 백그라운드 이미지 */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-40 mix-blend-screen"
          style={{ backgroundImage: "url('/hero-bg.png')" }}
        />
        {/* 그라데이션 오버레이 */}
        <div className="absolute inset-0 bg-gradient-to-b from-gray-900/50 via-emerald-900/60 to-gray-50/0 pointer-events-none" />

        {/* 동적 글로우 효과 */}
        {/* 프리미엄 배경 요소 */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none mix-blend-color-dodge">
          <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[40%] bg-emerald-500/30 blur-[100px] rounded-full animate-pulse-slow" />
          <div className="absolute bottom-[-10%] right-[-5%] w-[40%] h-[40%] bg-cyan-500/30 blur-[100px] rounded-full animate-pulse-slow" style={{ animationDelay: "2s" }} />

          {/* 플로팅 입자 */}
          <div className="absolute top-20 left-[10%] w-16 h-16 opacity-30 animate-float" style={{ animationDelay: "0s" }}>
            <img src="/icon-omega.png" alt="Omega" className="w-full h-full object-contain filter drop-shadow-[0_0_15px_rgba(16,185,129,0.5)]" />
          </div>
          <div className="absolute top-40 right-[15%] w-20 h-20 opacity-30 animate-float" style={{ animationDelay: "0.8s" }}>
            <img src="/icon-brain.png" alt="Brain" className="w-full h-full object-contain filter drop-shadow-[0_0_15px_rgba(45,212,191,0.5)]" />
          </div>
          <div className="absolute bottom-20 left-[20%] text-4xl opacity-20 filter blur-[1px] animate-float" style={{ animationDelay: "1.5s" }}>⚗️</div>
          <div className="absolute bottom-40 right-[25%] text-5xl opacity-20 filter blur-[1px] animate-float" style={{ animationDelay: "0.3s" }}>🔬</div>
        </div>

        {/* 하단 페이드 아웃 - 아래 섹션(bg-gray-50)과 자연스럽게 연결 */}
        <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-gray-50 via-gray-50/80 to-transparent pointer-events-none" />

        <div className="relative mx-auto max-w-2xl px-4 text-center">
          {/* 로고 */}
          <div className="flex items-center justify-center gap-2 mb-6">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30">
              <Pill size={22} className="text-white" />
            </div>
            <span className="text-white font-black text-xl tracking-tight">Nutri-Mixer</span>
          </div>

          {/* 헤드라인 */}
          <h1 className="text-4xl md:text-5xl font-black text-white mb-4 leading-tight">
            내 영양제들,
            <br />
            <span className="text-yellow-300">같이 먹어도 괜찮을까?</span>
          </h1>

          <p className="text-white/80 text-base md:text-lg mb-8 leading-relaxed">
            AI 기반 영양제 궁합 분석으로
            <br className="md:hidden" />{" "}
            최적의 조합을 찾아보세요 ✨
          </p>

          {/* 검색창 */}
          <div className="relative max-w-lg mx-auto group">
            <div className="absolute inset-0 bg-white/20 blur-xl rounded-[2.5rem] opacity-0 group-focus-within:opacity-100 transition-opacity duration-500" />
            <div className="relative flex items-center bg-white/10 backdrop-blur-2xl border border-white/30 rounded-[2.5rem] p-1.5 shadow-2xl transition-all duration-300 group-focus-within:bg-white/20 group-focus-within:border-white/50">
              <div className="pl-4 flex items-center justify-center text-white/60">
                <Search size={20} />
              </div>
              <Input
                ref={searchRef}
                type="text"
                placeholder="어떤 영양제를 찾으시나요? (비타민C, 오메가-3...)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent border-none text-white placeholder:text-white/40 focus-visible:ring-0 focus-visible:ring-offset-0 text-base md:text-lg h-12 flex-1 font-medium"
              />
              <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 bg-white/10 border border-white/20 rounded-full text-[10px] font-bold text-white/60 uppercase tracking-widest mr-2">
                <span>Press</span>
                <span className="bg-white/20 px-1.5 py-0.5 rounded leading-none">Enter</span>
              </div>
            </div>
          </div>

          {/* 통계 배지 */}
          <div className="flex items-center justify-center gap-4 mt-6 flex-wrap">
            {[
              { label: "영양제 종류", value: isLoadingList ? "..." : `${dbIngredients.length}종` },
              { label: "무료 분석", value: "무제한" },
              { label: "결과 확인", value: "실시간" },
            ].map((stat) => (
              <div
                key={stat.label}
                className="flex items-center gap-1.5 bg-white/15 backdrop-blur-sm rounded-full px-3 py-1.5 border border-white/20"
              >
                <span className="text-white/60 text-xs">{stat.label}</span>
                <span className="text-white font-bold text-sm">{stat.value}</span>
              </div>
            ))}
          </div>

          {/* 스크롤 다운 힌트 */}
          <div className="mt-8 animate-bounce">
            <ChevronDown size={24} className="text-white/50 mx-auto" />
          </div>
        </div>
      </section>


      {/* ============================================================
       * MAIN CONTENT
       * ============================================================ */}
      <main className="mx-auto max-w-2xl px-4 py-8">
        {/* ---- 인기 영양제 (홈화면 우선 표시) ---- */}
        {searchQuery === "" && selectedCategory === "all" && (
          <div className="mb-8 animate-fade-in-up">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles size={18} className="text-amber-500" />
              <h2 className="text-base font-bold text-gray-700">
                많이 찾는 영양제
              </h2>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 stagger-children">
              {popularIngredients.map((ing) => (
                <IngredientCard key={ing.id} ingredient={ing} />
              ))}
            </div>
          </div>
        )}

        {/* ---- 카테고리 필터 ---- */}
        <div className="flex gap-2 overflow-x-auto pb-4 mb-8 -mx-4 px-4 active:cursor-grabbing">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.key}
              onClick={() => setSelectedCategory(cat.key)}
              className={cn(
                "flex items-center gap-2 whitespace-nowrap px-4 py-2.5 rounded-2xl text-sm font-bold transition-all duration-300 flex-shrink-0",
                "border-2",
                selectedCategory === cat.key
                  ? "bg-slate-900 text-white border-slate-900 shadow-xl shadow-slate-200 scale-105"
                  : "bg-white text-slate-500 border-slate-100/80 hover:border-emerald-200 hover:text-emerald-600 hover:bg-emerald-50/30"
              )}
            >
              <span className="text-base">{cat.emoji}</span>
              <span className="tracking-tight">{cat.label}</span>
            </button>
          ))}
        </div>

        <div className="mb-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-gray-500">
              {searchQuery
                ? `"${searchQuery}" 검색 결과 (${filteredIngredients.length}개)`
                : selectedCategory === "all"
                  ? `전체 영양제 (${filteredIngredients.length}종)`
                  : `${CATEGORIES.find((c) => c.key === selectedCategory)?.label} (${filteredIngredients.length}종)`}
            </h2>
            <div className="flex items-center gap-1.5 text-xs text-gray-400">
              <Info size={12} />
              <span>2개 이상 선택 후 분석</span>
            </div>
          </div>

          {isLoadingList ? (
            <div className="text-center py-16 text-gray-400">
              <div className="animate-spin w-8 h-8 rounded-full border-4 border-emerald-500 border-t-transparent mx-auto mb-4"></div>
              <p className="font-medium animate-pulse">영양제 목록을 불러오는 중입니다...</p>
            </div>
          ) : filteredIngredients.length > 0 ? (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 stagger-children">
              {filteredIngredients.map((ing) => (
                <IngredientCard key={ing.id} ingredient={ing} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 text-gray-400">
              <div className="text-4xl mb-3">🔍</div>
              <p className="font-medium">검색 결과가 없어요</p>
              <p className="text-sm mt-1">다른 키워드로 검색해보세요</p>
            </div>
          )}
        </div>

        {/* ============================================================
         * 결과 섹션 (분석하기 클릭 후 표시)
         * ============================================================ */}
        <div ref={resultRef} className="mt-8">
          {isAnalyzing && <AnalyzingAnimation />}

          {!isAnalyzing && hasResult && analysisResult && (
            <>
              <div className="flex items-center gap-2 mb-6">
                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-emerald-200 to-transparent" />
                <h2 className="text-base font-bold text-gray-600 flex items-center gap-2 px-3">
                  <Sparkles size={16} className="text-emerald-500" />
                  분석 결과
                </h2>
                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-emerald-200 to-transparent" />
              </div>
              <AnalysisResults result={analysisResult} />
            </>
          )}
        </div>
      </main>

      {/* ============================================================
       * 플로팅 바구니 바 (하단 고정)
       * ============================================================ */}
      <FloatingBasketBar onAnalyze={handleAnalyze} />
    </div>
  );
}
