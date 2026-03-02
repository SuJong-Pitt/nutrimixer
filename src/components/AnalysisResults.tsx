"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Sparkles,
    TrendingUp,
    AlertTriangle,
    XCircle,
    ExternalLink,
    ShoppingCart,
    Star,
    Truck,
    RefreshCcw,
    Zap,
    ShieldCheck,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { motion, AnimatePresence } from "framer-motion";
import { useBasketStore } from "@/store/basketStore";
import type { CoupangProduct, AnalysisResult, InteractionResult } from "@/types/database";

interface AnalysisResultsProps {
    result: AnalysisResult;
    coupangProducts?: CoupangProduct[];
}

const interactionTypeConfig = {
    SYNERGY: {
        label: "시너지",
        color: "bg-emerald-500 text-white",
        headerColor: "from-white to-slate-50",
        shadowColor: "shadow-emerald-500/10",
        glowColor: "bg-emerald-500/5 shadow-[0_0_20px_rgba(16,185,129,0.1)]",
        icon: TrendingUp,
        iconColor: "text-emerald-500",
        borderColor: "border-emerald-100/50",
    },
    CAUTION: {
        label: "주의",
        color: "bg-amber-500 text-white",
        headerColor: "from-white to-slate-50",
        shadowColor: "shadow-amber-500/10",
        glowColor: "bg-amber-500/5 shadow-[0_0_20px_rgba(245,158,11,0.1)]",
        icon: AlertTriangle,
        iconColor: "text-amber-500",
        borderColor: "border-amber-100/50",
    },
    CONFLICT: {
        label: "충돌",
        color: "bg-red-500 text-white",
        headerColor: "from-white to-slate-50",
        shadowColor: "shadow-red-500/10",
        glowColor: "bg-red-500/5 shadow-[0_0_20px_rgba(239,68,68,0.1)]",
        icon: XCircle,
        iconColor: "text-red-500",
        borderColor: "border-red-100/50",
    },
} as const;

/** 점수 링 컴포넌트 */
function ScoreRing({ score }: { score: number }) {
    const radius = 60;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (score / 100) * circumference;

    return (
        <div className="relative flex items-center justify-center w-48 h-48 md:w-56 md:h-56">
            <svg className="w-full h-full transform -rotate-90 drop-shadow-[0_0_15px_rgba(52,211,153,0.2)]">
                <circle
                    cx="50%"
                    cy="50%"
                    r={radius}
                    stroke="currentColor"
                    strokeWidth="10"
                    fill="transparent"
                    className="text-white/5"
                />
                <circle
                    cx="50%"
                    cy="50%"
                    r={radius}
                    stroke="currentColor"
                    strokeWidth="10"
                    fill="transparent"
                    strokeDasharray={circumference}
                    style={{
                        strokeDashoffset: offset,
                        transition: "stroke-dashoffset 1.5s cubic-bezier(0.4, 0, 0.2, 1)",
                    }}
                    strokeLinecap="round"
                    className={cn(
                        score >= 70
                            ? "text-emerald-400"
                            : score >= 40
                                ? "text-amber-400"
                                : "text-red-400"
                    )}
                />
            </svg>
            <div className="absolute flex flex-col items-center justify-center text-white">
                <span className="text-5xl md:text-6xl font-black tracking-tighter drop-shadow-md">{score}</span>
                <span className="text-[11px] md:text-xs uppercase font-black text-white/40 tracking-[0.2em] mt-1">아이 스코어</span>
            </div>
        </div>
    );
}

/** 상호작용 카드 컴포넌트 */
function InteractionCard({ result }: { result: InteractionResult }) {
    if (!result.interaction) return null;
    const { type, title, reason, recommendation } = result.interaction;
    const config = interactionTypeConfig[type];
    const Icon = config.icon;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -5 }}
            transition={{ duration: 0.3 }}
        >
            <Card className={cn(
                "group overflow-hidden border transition-all duration-300",
                "bg-gradient-to-br from-white to-slate-50 shadow-[0_20px_50px_rgba(0,0,0,0.05)]",
                config.borderColor,
                config.shadowColor
            )}>
                <CardContent className="p-6 relative">
                    <div className={cn("absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500", config.glowColor)} />

                    <div className="relative flex items-start gap-5">
                        <div
                            className={cn(
                                "w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm transition-all duration-500 bg-white border border-gray-100 group-hover:scale-110 group-hover:rotate-3",
                                config.iconColor
                            )}
                        >
                            <Icon size={24} />
                        </div>
                        <div className="flex-1 min-w-0 font-sans tracking-tight">
                            <div className="flex items-center gap-2 mb-2 flex-wrap">
                                <h4 className="font-bold text-lg text-slate-900 leading-tight tracking-tight">{title}</h4>
                                <Badge className={cn("text-[10px] px-2 py-0 h-5 border-none font-black uppercase tracking-wider", config.color)}>
                                    {config.label}
                                </Badge>
                            </div>
                            <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400 mb-4 uppercase tracking-widest">
                                <span className="text-slate-600 font-black">{result.pair[0].name}</span>
                                <Zap size={10} className="text-emerald-400 animate-pulse" />
                                <span className="text-slate-600 font-black">{result.pair[1].name}</span>
                            </div>
                            <p className="text-[15px] text-slate-600 leading-relaxed mb-5 font-medium">{reason}</p>

                            {recommendation && (
                                <div className="p-4 rounded-2xl bg-slate-50/80 backdrop-blur-sm border border-slate-100 shadow-inner group-hover:bg-white transition-colors">
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="p-1 bg-emerald-100 rounded-lg">
                                            <ShieldCheck size={14} className="text-emerald-600" />
                                        </div>
                                        <span className="text-[11px] text-emerald-800 font-black uppercase tracking-tighter">전문가 권고 프로토콜</span>
                                    </div>
                                    <p className="text-sm text-slate-700 font-semibold leading-relaxed">{recommendation}</p>
                                </div>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
}

/** 프리미엄 상품 카드 */
function ProductCard({ product }: { product: CoupangProduct }) {
    return (
        <Card className="group overflow-hidden border-none shadow-sm hover:shadow-xl transition-all duration-500 rounded-3xl bg-white flex flex-col h-full relative">
            {/* 상단 장식 배지 */}
            <div className="absolute top-3 left-3 z-10">
                <Badge className="bg-emerald-500/90 text-[10px] font-black border-none px-2 py-0 h-4 backdrop-blur-sm shadow-sm select-none text-white">
                    최우수 추천
                </Badge>
            </div>

            {/* 이미지 영역 */}
            <div className="aspect-[4/3] bg-gradient-to-br from-gray-50 to-slate-100 flex items-center justify-center relative overflow-hidden">
                {product.image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                        src={product.image_url}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-4xl group-hover:scale-125 transition-transform duration-700 grayscale-[0.5] group-hover:grayscale-0">
                        💊
                    </div>
                )}
                {/* 오버레이 효과 */}
                <div className="absolute inset-0 bg-emerald-500/0 group-hover:bg-emerald-500/5 transition-colors duration-500" />
            </div>

            <CardContent className="p-4 flex flex-col flex-1">
                <div className="space-y-1 mb-3">
                    <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest leading-none">추천 제품</p>
                    <h4 className="font-bold text-sm text-gray-900 line-clamp-2 leading-snug group-hover:text-emerald-700 transition-colors">
                        {product.name}
                    </h4>
                </div>

                <div className="mt-auto space-y-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-0.5 text-amber-500">
                            {Array.from({ length: 5 }).map((_, i) => (
                                <Star
                                    key={i}
                                    size={10}
                                    fill={i < (product.rating || 5) ? "currentColor" : "none"}
                                    className={i < (product.rating || 5) ? "text-amber-500" : "text-gray-200"}
                                />
                            ))}
                            <span className="text-[10px] font-bold text-gray-400 ml-1">{product.rating || "4.8"}</span>
                        </div>
                        <div className="flex items-center gap-1 text-[11px] font-black text-orange-500 bg-orange-50 px-1.5 py-0.5 rounded-md">
                            <Truck size={10} />
                            로켓배송
                        </div>
                    </div>

                    <div className="flex items-end justify-between mb-1">
                        <div className="flex flex-col">
                            {product.discount_rate && (
                                <span className="text-[10px] text-red-500 font-bold leading-none mb-0.5">{product.discount_rate}% 할인가</span>
                            )}
                            <span className="text-xl font-black text-gray-900 leading-none">
                                {product.price > 0 ? `${product.price.toLocaleString()}원` : "최저가 확인"}
                            </span>
                        </div>
                        {product.original_price && (
                            <span className="text-xs text-gray-300 line-through font-medium">
                                {product.original_price.toLocaleString()}원
                            </span>
                        )}
                    </div>

                    <Button
                        variant="default"
                        className="w-full bg-gray-950 hover:bg-emerald-600 text-white rounded-xl h-10 text-[11px] font-black tracking-tight border-none shadow-sm transition-all duration-300 group-hover:shadow-emerald-200"
                        asChild
                    >
                        <a href={product.product_url} target="_blank" rel="noopener noreferrer">
                            <ShoppingCart size={14} className="mr-1.5" />
                            최저가로 구매하기
                        </a>
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}

export default function AnalysisResults({ result, coupangProducts = [] }: AnalysisResultsProps) {
    const { clearBasket, setHasResult } = useBasketStore();

    const allInteractions = [
        ...result.synergies,
        ...result.cautions,
        ...result.conflicts,
    ].filter((r) => r.interaction !== null);

    return (
        <div className="space-y-12 pb-32 animate-fade-in-up max-w-4xl mx-auto">
            {/* 종합 점수 카드 - Anti-gravity & Frosted Glass vibes */}
            <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-emerald-500 rounded-[3rem] blur opacity-10 group-hover:opacity-20 transition duration-1000 group-hover:duration-200"></div>
                <Card className="relative rounded-[2.5rem] overflow-hidden border-none bg-slate-900 text-white shadow-2xl texture-grain">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 blur-[80px] rounded-full pointer-events-none -mr-32 -mt-32" />
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/10 blur-[80px] rounded-full pointer-events-none -ml-32 -mb-32" />

                    <CardContent className="p-10 md:p-12">
                        <div className="flex flex-col md:flex-row items-center justify-between gap-12">
                            <div className="flex-1 text-center md:text-left space-y-6">
                                <div className="flex items-center justify-center md:justify-start gap-2.5">
                                    <div className="bg-indigo-500/20 p-2 rounded-xl border border-indigo-400/20 backdrop-blur-md">
                                        <Sparkles size={18} className="text-indigo-300" />
                                    </div>
                                    <span className="text-sm font-black text-indigo-200 uppercase tracking-[0.2em] drop-shadow-sm">AI 정밀 궁합 분석 리포트</span>
                                </div>

                                <h2 className="text-4xl md:text-5xl font-black tracking-tight leading-tight">
                                    {result.score >= 70
                                        ? "최상의 조합입니다"
                                        : result.score >= 40
                                            ? "주의가 필요합니다"
                                            : "함께 복용을 권하지 않습니다"}
                                </h2>

                                <p className="text-lg text-white/80 leading-relaxed max-w-lg mx-auto md:mx-0 font-medium tracking-tight">
                                    {result.summary}
                                </p>

                                <div className="pt-4 flex flex-wrap justify-center md:justify-start gap-2.5">
                                    {result.ingredients.map((ing) => (
                                        <div
                                            key={ing.id}
                                            className="flex items-center gap-2 text-xs bg-white/5 border border-white/10 backdrop-blur-xl rounded-2xl px-4 py-2.5 font-bold transition-all hover:bg-white/10 hover:border-white/20 hover:-translate-y-0.5"
                                        >
                                            <span className="text-[15px]">{ing.icon_emoji}</span>
                                            <span className="tracking-tight text-white/90">{ing.name}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="relative">
                                <div className="absolute inset-0 bg-indigo-500/20 blur-3xl rounded-full scale-75 animate-pulse-slow" />
                                <ScoreRing score={result.score} />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* 궁합 상세 섹션 */}
            <div className="space-y-6">
                <div className="flex items-end justify-between px-2">
                    <div className="space-y-1">
                        <h3 className="text-2xl font-black text-slate-900 tracking-tight">
                            상호작용 매트릭스
                        </h3>
                        <p className="text-sm text-slate-500 font-medium">영양 성분 간의 생화학적 시너지와 충돌 분석</p>
                    </div>
                    <Badge variant="outline" className="rounded-lg px-3 py-1 border-slate-200 text-slate-400 font-bold bg-slate-50">
                        {allInteractions.length}건의 분석결과
                    </Badge>
                </div>

                {allInteractions.length > 0 ? (
                    <div className="grid gap-6">
                        {[...result.synergies, ...result.cautions, ...result.conflicts].map(
                            (r, idx) =>
                                r.interaction && (
                                    <InteractionCard key={r.interaction.id ?? idx} result={r} />
                                )
                        )}
                    </div>
                ) : (
                    <div className="rounded-[2rem] bg-slate-50/50 border border-slate-100 p-12 text-center shadow-inner backdrop-blur-sm">
                        <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mx-auto mb-4 border border-slate-100">
                            <ShieldCheck size={32} className="text-emerald-500" />
                        </div>
                        <p className="text-slate-900 font-bold text-lg">상호작용 위험 없음</p>
                        <p className="text-slate-500 font-medium mt-2 max-w-sm mx-auto">선택하신 영양 성분들은 함께 복용하셔도 안전한 것으로 분석되었습니다.</p>
                    </div>
                )}
            </div>

            {/* 쇼핑 섹션 - Dashboard Main glass style */}
            <div className="relative rounded-[3rem] bg-white border border-slate-100 p-10 md:p-12 shadow-[0_30px_60px_rgba(0,0,0,0.03)] overflow-hidden">
                <div className="absolute -top-24 -right-24 w-64 h-64 bg-indigo-50 rounded-full blur-3xl opacity-50" />
                <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-emerald-50 rounded-full blur-3xl opacity-50" />

                <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between mb-12 gap-6">
                    <div className="space-y-2">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-50 rounded-full border border-indigo-100 text-indigo-600 font-black text-[10px] uppercase tracking-widest">
                            Shop Protocol
                        </div>
                        <h3 className="text-3xl font-black text-slate-900 tracking-tight">
                            맞춤형 제품 추천
                        </h3>
                        <p className="text-slate-500 font-medium">분석 결과에 따른 정밀 검증된 프리미엄 제품 라인업</p>
                    </div>
                    <Badge variant="secondary" className="bg-slate-100 text-slate-400 border-none rounded-lg px-4 py-1.5 font-bold uppercase tracking-widest text-[10px]">
                        AD DISCLOSURE
                    </Badge>
                </div>

                <div className="relative grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
                    {coupangProducts.length > 0 ? (
                        coupangProducts.map((product) => (
                            <ProductCard key={product.product_id} product={product} />
                        ))
                    ) : (
                        result.ingredients.slice(0, 3).map((ing) => (
                            <ProductCard
                                key={ing.id}
                                product={{
                                    product_id: `mock-${ing.id}`,
                                    name: `${ing.name} 프리미엄 추천 제품`,
                                    product_url: `https://www.coupang.com/np/search?q=${encodeURIComponent(ing.coupang_search_keyword)}`,
                                    image_url: "",
                                    price: 32000,
                                    original_price: 39000,
                                    discount_rate: 18,
                                    is_rocket: true,
                                    rating: 4.9,
                                    review_count: 2450
                                }}
                            />
                        ))
                    )}
                </div>
            </div>

            {/* 다시 분석하기 버튼 - 3D Lift Effect */}
            <div className="pt-4 px-4">
                <Button
                    onClick={clearBasket}
                    variant="outline"
                    className={cn(
                        "w-full py-10 rounded-[2.5rem] border-none",
                        "bg-white shadow-[0_10px_30px_rgba(0,0,0,0.04)]",
                        "hover:shadow-[0_20px_40px_rgba(79,70,229,0.1)] hover:-translate-y-1 group active:translate-y-0 active:shadow-inner",
                        "transition-all duration-500 ease-out font-black text-lg text-slate-900 tracking-tight ring-1 ring-slate-100"
                    )}
                >
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-indigo-50 rounded-2xl group-hover:bg-indigo-600 group-hover:text-white transition-colors duration-500 shadow-sm">
                            <RefreshCcw size={24} className="group-hover:rotate-180 transition-transform duration-1000" />
                        </div>
                        분석 리셋 및 새로 시작하기
                    </div>
                </Button>
            </div>

            {/* 법적 고지 - Clear Typography */}
            <div className="text-center space-y-2 pb-12">
                <div className="inline-block px-4 py-1.5 bg-slate-50 rounded-full border border-slate-100">
                    <p className="text-[11px] text-slate-400 font-bold uppercase tracking-[0.1em] flex items-center gap-2">
                        <AlertTriangle size={12} className="text-amber-500" />
                        의학적 고지 사항
                    </p>
                </div>
                <p className="text-xs text-slate-400 leading-normal max-w-2xl mx-auto font-medium">
                    본 리포트는 정보 제공만을 목적으로 하며 의학적 진단을 대체할 수 없습니다.
                    개인의 체질에 따라 상호작용은 다르게 나타날 수 있으므로, 반드시 전문의와 상담하시기 바랍니다.
                </p>
            </div>
        </div>
    );
}
