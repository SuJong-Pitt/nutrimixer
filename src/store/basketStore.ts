"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { Ingredient } from "@/types/database";

const MAX_BASKET_SIZE = 10;

interface BasketState {
    // State
    selectedIngredients: Ingredient[];
    isAnalyzing: boolean;
    hasResult: boolean;

    // Actions
    addIngredient: (ingredient: Ingredient) => void;
    removeIngredient: (id: string) => void;
    toggleIngredient: (ingredient: Ingredient) => void;
    clearBasket: () => void;
    setAnalyzing: (value: boolean) => void;
    setHasResult: (value: boolean) => void;
    isSelected: (id: string) => boolean;
}

/**
 * 영양제 바구니 Zustand 스토어
 * - persist 미들웨어로 localStorage와 자동 동기화
 * - 최대 10개 제한
 */
export const useBasketStore = create<BasketState>()(
    persist(
        (set, get) => ({
            selectedIngredients: [],
            isAnalyzing: false,
            hasResult: false,

            addIngredient: (ingredient) => {
                const { selectedIngredients } = get();
                if (selectedIngredients.length >= MAX_BASKET_SIZE) return;
                if (selectedIngredients.some((i) => i.id === ingredient.id)) return;
                set({
                    selectedIngredients: [...selectedIngredients, ingredient],
                    hasResult: false // 바구니 변경 시 결과 초기화
                });
            },

            removeIngredient: (id) => {
                set((state) => ({
                    selectedIngredients: state.selectedIngredients.filter((i) => i.id !== id),
                    hasResult: false, // 바구니 변경 시 결과 초기화
                }));
            },

            toggleIngredient: (ingredient) => {
                const { selectedIngredients, addIngredient, removeIngredient } = get();
                if (selectedIngredients.some((i) => i.id === ingredient.id)) {
                    removeIngredient(ingredient.id);
                } else {
                    addIngredient(ingredient);
                }
            },

            clearBasket: () => {
                set({ selectedIngredients: [], hasResult: false });
            },

            setAnalyzing: (value) => set({ isAnalyzing: value }),

            setHasResult: (value) => set({ hasResult: value }),

            isSelected: (id) => {
                return get().selectedIngredients.some((i) => i.id === id);
            },
        }),
        {
            name: "nutrimixer-basket", // localStorage key
            storage: createJSONStorage(() => localStorage),
            partialize: (state) => ({
                // 분석 상태는 저장하지 않고 선택된 영양제만 저장
                selectedIngredients: state.selectedIngredients,
            }),
        }
    )
);

export { MAX_BASKET_SIZE };
