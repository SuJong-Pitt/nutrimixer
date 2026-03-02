"use client";

import { useBasketStore, MAX_BASKET_SIZE } from "@/store/basketStore";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { FlaskConical, X, Sparkles, ShoppingBasket } from "lucide-react";
import { useEffect, useState } from "react";

interface FloatingBasketBarProps {
    onAnalyze: () => void;
}

export default function FloatingBasketBar({ onAnalyze }: FloatingBasketBarProps) {
    const { selectedIngredients, removeIngredient, clearBasket, isAnalyzing, hasResult } = useBasketStore();
    const [isVisible, setIsVisible] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);

    const count = selectedIngredients.length;

    // 영양제가 선택되면 바가 올라오는 애니메이션
    useEffect(() => {
        setIsVisible(count > 0 && !hasResult);
    }, [count, hasResult]);

    if (!isVisible) return null;

    return (
        <div
            className={cn(
                "fixed bottom-0 left-0 right-0 z-50",
                "transition-all duration-500 ease-out",
                isVisible ? "translate-y-0" : "translate-y-full"
            )}
        >
            {/* 배경 블러 오버레이 (확장 시) */}
            {isExpanded && (
                <div
                    className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[-1]"
                    onClick={() => setIsExpanded(false)}
                />
            )}

            {/* 메인 바 */}
            <div className="mx-auto max-w-3xl px-4 pb-4 md:pb-6">
                <div
                    className={cn(
                        "rounded-[2rem] shadow-2xl overflow-hidden text-rendering-optimizeLegibility",
                        "bg-white/10 backdrop-blur-2xl border border-white/20",
                        "transition-all duration-500 hover:shadow-emerald-500/20",
                        "relative texture-grain"
                    )}
                >
                    {/* 선명한 내부 배경 */}
                    <div className="absolute inset-0 bg-gradient-to-r from-emerald-600/90 via-teal-600/90 to-cyan-600/90 -z-10" />

                    {/* 확장된 영양제 목록 */}
                    {isExpanded && count > 0 && (
                        <div className="px-4 pt-4 pb-2">
                            <div className="flex flex-wrap gap-2">
                                {selectedIngredients.map((ingredient) => (
                                    <div
                                        key={ingredient.id}
                                        className="flex items-center gap-1.5 bg-white/20 backdrop-blur-sm rounded-full px-3 py-1.5 text-white text-sm font-medium group"
                                    >
                                        <span>{ingredient.icon_emoji}</span>
                                        <span>{ingredient.name}</span>
                                        <button
                                            onClick={() => removeIngredient(ingredient.id)}
                                            className="ml-1 opacity-60 hover:opacity-100 transition-opacity rounded-full hover:bg-white/20 p-0.5"
                                        >
                                            <X size={12} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* 컨트롤 영역 */}
                    <div className="flex items-center gap-3 p-3 md:p-4">
                        {/* 바구니 아이콘 + 카운트 */}
                        <button
                            onClick={() => setIsExpanded(!isExpanded)}
                            className="flex items-center gap-2.5 flex-1 text-white"
                        >
                            <div className="relative">
                                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                                    <ShoppingBasket size={20} className="text-white" />
                                </div>
                                {count > 0 && (
                                    <div className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-yellow-400 text-gray-900 text-xs font-bold flex items-center justify-center animate-bounce-subtle">
                                        {count}
                                    </div>
                                )}
                            </div>

                            <div className="text-left">
                                <p className="text-white font-semibold text-sm leading-tight">
                                    {count}개 영양제 선택됨
                                </p>
                                <p className="text-white/70 text-xs">
                                    {count < 2
                                        ? "2개 이상 선택하면 분석할 수 있어요"
                                        : isExpanded
                                            ? "탭하여 접기"
                                            : `최대 ${MAX_BASKET_SIZE}개 · 탭하여 목록 보기`}
                                </p>
                            </div>
                        </button>

                        {/* 초기화 버튼 */}
                        {count > 0 && (
                            <button
                                onClick={clearBasket}
                                className="text-white/60 hover:text-white/90 transition-colors p-2 rounded-lg hover:bg-white/10"
                            >
                                <X size={16} />
                            </button>
                        )}

                        {/* 분석하기 버튼 */}
                        <Button
                            onClick={onAnalyze}
                            disabled={count < 2 || isAnalyzing}
                            className={cn(
                                "rounded-xl font-bold text-sm px-5 py-2.5 h-auto",
                                "bg-white text-emerald-700 hover:bg-yellow-50",
                                "shadow-lg shadow-black/20",
                                "disabled:opacity-50 disabled:cursor-not-allowed",
                                "transition-all duration-200 active:scale-95",
                                count >= 2 && !isAnalyzing && "animate-pulse-glow"
                            )}
                        >
                            {isAnalyzing ? (
                                <span className="flex items-center gap-1.5">
                                    <FlaskConical size={15} className="animate-spin" />
                                    분석 중...
                                </span>
                            ) : (
                                <span className="flex items-center gap-1.5">
                                    <Sparkles size={15} />
                                    궁합 분석하기
                                </span>
                            )}
                        </Button>
                    </div>

                    {/* 진행 바 (선택 개수에 따라) */}
                    <div className="h-1 bg-white/20 rounded-b-2xl overflow-hidden">
                        <div
                            className="h-full bg-yellow-300 transition-all duration-500 ease-out"
                            style={{ width: `${(count / MAX_BASKET_SIZE) * 100}%` }}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
