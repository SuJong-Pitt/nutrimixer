"use client";

import { useEffect, useState } from "react";
import { FlaskConical, Atom, Binary, Database, Cpu, Sparkles, Search, Fingerprint } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

const ANALYZING_MESSAGES = [
    "영양 성분을 분석하고 있어요... 🔬",
    "궁합 데이터베이스를 검색 중... 📚",
    "상호작용 패턴을 계산하고 있어요... ⚗️",
    "전문가 권고사항을 취합 중... 🧑‍⚕️",
    "최적의 복용 순서를 산출하고 있어요... ⏱️",
    "분석 결과를 정리하는 중... ✨",
];

export default function AnalyzingAnimation() {
    const [messageIdx, setMessageIdx] = useState(0);
    const [dotCount, setDotCount] = useState(0);
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        const msgInterval = setInterval(() => {
            setMessageIdx((prev) => (prev + 1) % ANALYZING_MESSAGES.length);
        }, 1500);

        const dotInterval = setInterval(() => {
            setDotCount((prev) => (prev + 1) % 4);
        }, 400);

        const progressInterval = setInterval(() => {
            setProgress((prev) => {
                if (prev >= 98) return prev;
                // 초반에는 빠르고 뒤로 갈수록 느릿하게 (로그 느낌)
                const increment = (100 - prev) * 0.05 + Math.random();
                return prev + increment;
            });
        }, 300);

        return () => {
            clearInterval(msgInterval);
            clearInterval(dotInterval);
            clearInterval(progressInterval);
        };
    }, []);

    return (
        <div className="flex flex-col items-center justify-center py-24 md:py-32 gap-10 overflow-hidden relative">
            {/* 배경 장식 */}
            <div className="absolute inset-0 pointer-events-none opacity-50">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-emerald-50 rounded-full blur-[100px]" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-cyan-50 rounded-full blur-[80px]" />
            </div>

            {/* 분석 로봇 애니메이션 메인 영역 */}
            <div className="relative">
                {/* 외부 기술적 링들 */}
                <div className="absolute inset-[-40px] rounded-full border border-dashed border-emerald-200 animate-spin opacity-40" style={{ animationDuration: "12s" }} />
                <div className="absolute inset-[-20px] rounded-full border border-emerald-100/50 animate-spin opacity-30" style={{ animationDuration: "8s", animationDirection: "reverse" }} />

                {/* 실제 스캐닝 효과 */}
                <div className="absolute inset-0 rounded-full overflow-hidden z-20 pointer-events-none">
                    <div className="w-full h-1/3 bg-gradient-to-b from-transparent via-emerald-400/20 to-transparent animate-scan" />
                </div>

                {/* 중앙 코어 */}
                <div className="relative w-32 h-32 rounded-[2.5rem] bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-600 flex items-center justify-center shadow-2xl shadow-emerald-200/50 transform rotate-45 group h-32 w-32">
                    <div className="transform -rotate-45 flex flex-col items-center justify-center text-white">
                        <div className="relative">
                            <Fingerprint size={48} className="text-white/40 absolute inset-0 blur-[1px]" />
                            <Cpu size={48} className="text-white relative animate-pulse" />
                        </div>
                    </div>

                    {/* 글로우 효과 */}
                    <div className="absolute inset-0 rounded-[2.5rem] bg-white opacity-0 group-hover:opacity-20 transition-opacity duration-500" />
                </div>

                {/* 위성 입자들 (궤도 회전) */}
                <div className="absolute inset-0">
                    {[
                        { icon: FlaskConical, delay: "0s", color: "bg-emerald-500" },
                        { icon: Atom, delay: "1.5s", color: "bg-cyan-500" },
                        { icon: Binary, delay: "3s", color: "bg-teal-500" },
                        { icon: Sparkles, delay: "4.5s", color: "bg-yellow-400" },
                    ].map((item, i) => (
                        <div
                            key={i}
                            className="absolute inset-0 animate-orbit"
                            style={{ animationDelay: item.delay, animationDuration: "6s" }}
                        >
                            <div className={cn(
                                "absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-xl shadow-lg flex items-center justify-center text-white border border-white/20",
                                item.color
                            )}>
                                <item.icon size={16} />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* 상태 텍스트 섹션 */}
            <div className="relative z-10 text-center space-y-4 max-w-sm">
                <div className="bg-emerald-50 text-emerald-700 text-[10px] font-black px-3 py-1 rounded-full border border-emerald-100 uppercase tracking-widest inline-flex items-center gap-1.5 mb-2">
                    <Search size={10} />
                    Processing Interaction Data
                </div>

                <div className="h-16 flex items-center justify-center overflow-hidden">
                    <h3 className="text-2xl font-black text-gray-900 animate-fade-in-up tracking-tight leading-tight" key={messageIdx}>
                        {ANALYZING_MESSAGES[messageIdx]}
                    </h3>
                </div>

                {/* 프로그레스 섹션 */}
                <div className="space-y-4 pt-4">
                    <div className="relative h-3 w-72 bg-gray-100 rounded-full overflow-hidden shadow-inner">
                        {/* 베이스 바 */}
                        <div
                            className="absolute inset-y-0 left-0 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 transition-all duration-700 ease-out flex items-center"
                            style={{ width: `${progress}%` }}
                        >
                            {/* 흐르는 광택 효과 */}
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent w-20 transform -skew-x-12 translate-x-[-100%] animate-[shimmer_2s_infinite]" />
                        </div>
                    </div>

                    <div className="flex items-center justify-between px-1">
                        <div className="flex items-center gap-2">
                            <Database size={12} className="text-gray-400" />
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">
                                Database: <span className="text-emerald-600">Syncing...</span>
                            </span>
                        </div>
                        <span className="text-xl font-black tracking-tighter text-gray-900">
                            {Math.floor(progress)}<span className="text-xs text-gray-400">%</span>
                        </span>
                    </div>
                </div>
            </div>

            {/* 배경 스타일링용 추가 (Keyframes) */}
            <style jsx>{`
                @keyframes shimmer {
                    0% { transform: translateX(-150%) skewX(-12deg); }
                    100% { transform: translateX(350%) skewX(-12deg); }
                }
            `}</style>
        </div>
    );
}
