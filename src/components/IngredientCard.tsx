"use client";

import type { Ingredient } from "@/types/database";
import { useBasketStore } from "@/store/basketStore";
import { cn } from "@/lib/utils";
import { Check, Clock, Info, HelpCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip";

import { useHasMounted } from "@/hooks/useHasMounted";

interface IngredientCardProps {
    ingredient: Ingredient;
}

const dosageTimeLabels: Record<Ingredient["dosage_time"], string> = {
    before_meal: "식전",
    after_meal: "식후",
    any_time: "아무때나",
    morning: "아침",
    evening: "저녁",
};

const dosageTimeColors: Record<Ingredient["dosage_time"], string> = {
    before_meal: "bg-amber-100 text-amber-700",
    after_meal: "bg-teal-100 text-teal-700",
    any_time: "bg-gray-100 text-gray-600",
    morning: "bg-orange-100 text-orange-700",
    evening: "bg-indigo-100 text-indigo-700",
};

export default function IngredientCard({ ingredient }: IngredientCardProps) {
    const hasMounted = useHasMounted();
    const { isSelected, toggleIngredient } = useBasketStore();
    const selected = hasMounted ? isSelected(ingredient.id) : false;

    return (
        <Tooltip>
            <TooltipTrigger asChild>
                <button
                    onClick={() => toggleIngredient(ingredient)}
                    className={cn(
                        "group relative w-full text-left rounded-2xl p-4 border transition-all duration-500",
                        "hover:shadow-2xl hover:-translate-y-1 active:scale-[0.98]",
                        "font-sans overflow-hidden",
                        selected
                            ? "border-emerald-500/50 bg-gradient-to-br from-emerald-50 to-teal-100/50 shadow-emerald-100 shadow-xl texture-grain"
                            : "border-slate-100 bg-white hover:border-emerald-200 hover:bg-emerald-50/10 glass-card"
                    )}
                >
                    {/* 선택 체크마크 */}
                    <div
                        className={cn(
                            "absolute top-3 right-3 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-300",
                            selected
                                ? "bg-emerald-500 border-emerald-500 scale-100 shadow-sm"
                                : "border-gray-200 scale-75 opacity-0 group-hover:opacity-100 group-hover:scale-90 group-hover:border-emerald-300"
                        )}
                    >
                        <Check
                            size={13}
                            className={cn(
                                "transition-opacity duration-300",
                                selected ? "opacity-100 text-white" : "opacity-0"
                            )}
                        />
                    </div>

                    {/* 인기 배지 */}
                    {ingredient.is_popular && (
                        <div className="absolute top-3 left-3">
                            <Badge className="bg-gradient-to-r from-amber-400 to-orange-500 border-none text-[10px] font-bold px-2 py-0 h-4 text-white hover:from-amber-400 hover:to-orange-500">
                                POPULAR
                            </Badge>
                        </div>
                    )}

                    {/* 이모지 아이콘 */}
                    <div
                        className={cn(
                            "w-12 h-12 rounded-2xl flex items-center justify-center text-2xl mb-4 transition-all duration-500 shadow-sm",
                            selected
                                ? "bg-white scale-110 shadow-emerald-200/50"
                                : "bg-gray-50 group-hover:bg-white group-hover:scale-110 group-hover:shadow-emerald-100"
                        )}
                    >
                        {ingredient.icon_emoji}
                    </div>

                    {/* 이름 */}
                    <h3
                        className={cn(
                            "font-bold text-base mb-1 transition-colors tracking-tight",
                            selected ? "text-emerald-800" : "text-gray-900"
                        )}
                    >
                        {ingredient.name}
                    </h3>

                    {/* 짧은 설명 */}
                    <p className="text-[11px] text-gray-500 mb-4 line-clamp-2 leading-relaxed font-medium">
                        {ingredient.short_description}
                    </p>

                    {/* 하단 상세 정보 */}
                    <div className="flex items-center justify-between mt-auto">
                        <div className="flex items-center gap-1.5">
                            <Clock size={11} className="text-emerald-500/70" />
                            <Badge variant="secondary" className={cn(
                                "text-[10px] font-bold px-2 py-0 h-4 border-none",
                                dosageTimeColors[ingredient.dosage_time]
                            )}>
                                {dosageTimeLabels[ingredient.dosage_time]}
                            </Badge>
                        </div>
                        <HelpCircle size={12} className="text-gray-300 group-hover:text-emerald-400 transition-colors" />
                    </div>

                    {/* 선택 상태 하이라이트 효과 */}
                    {selected && (
                        <div className="absolute inset-0 rounded-2xl ring-2 ring-emerald-500/20 ring-offset-2 pointer-events-none animate-pulse" />
                    )}
                </button>
            </TooltipTrigger>
            <TooltipContent side="top" className="max-w-[200px] p-3 rounded-xl bg-gray-900 text-white border-gray-800 shadow-2xl">
                <p className="text-xs leading-relaxed font-medium">{ingredient.description}</p>
            </TooltipContent>
        </Tooltip>
    );
}
