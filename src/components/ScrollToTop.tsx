"use client";

import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

export default function ScrollToTop() {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const toggleVisibility = () => {
            // 400px 이상 스크롤 시 버튼 표시
            if (window.scrollY > 400) {
                setIsVisible(true);
            } else {
                setIsVisible(false);
            }
        };

        window.addEventListener("scroll", toggleVisibility);
        return () => window.removeEventListener("scroll", toggleVisibility);
    }, []);

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: "smooth",
        });
    };

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.button
                    initial={{ opacity: 0, y: 20, scale: 0.8 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 20, scale: 0.8 }}
                    whileHover={{ scale: 1.1, y: -2 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={scrollToTop}
                    className={cn(
                        "fixed bottom-24 right-6 z-40 md:bottom-32 md:right-10",
                        "w-12 h-12 rounded-2xl flex items-center justify-center",
                        "bg-white/80 backdrop-blur-xl border border-emerald-100",
                        "shadow-[0_10px_25px_-5px_rgba(16,185,129,0.2)]",
                        "text-emerald-600 transition-colors hover:text-emerald-700 hover:bg-white",
                        "texture-grain"
                    )}
                    aria-label="맨 위로 이동"
                >
                    <ArrowUp size={24} strokeWidth={2.5} />

                    {/* 장식용 글로우 효과 */}
                    <div className="absolute inset-0 rounded-2xl bg-emerald-500/10 blur-xl opacity-0 hover:opacity-100 transition-opacity -z-10" />
                </motion.button>
            )}
        </AnimatePresence>
    );
}
