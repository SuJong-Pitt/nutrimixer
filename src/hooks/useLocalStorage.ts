"use client";

import { useState, useEffect, useCallback } from "react";

/**
 * useLocalStorage - localStorage와 동기화되는 커스텀 훅
 *
 * - SSR 안전: 서버 사이드 렌더링 시 undefined 방지
 * - 타입 안전: 제네릭으로 타입 추론
 * - 에러 방지: localStorage 접근 실패 시 fallback 처리
 */
export function useLocalStorage<T>(
    key: string,
    initialValue: T
): [T, (value: T | ((prev: T) => T)) => void, () => void] {
    // 초기 상태: SSR에서는 initialValue 사용, 클라이언트에서는 localStorage에서 읽기
    const [storedValue, setStoredValue] = useState<T>(() => {
        if (typeof window === "undefined") {
            return initialValue;
        }
        try {
            const item = window.localStorage.getItem(key);
            return item ? (JSON.parse(item) as T) : initialValue;
        } catch (error) {
            console.warn(`[useLocalStorage] Error reading key "${key}":`, error);
            return initialValue;
        }
    });

    // localStorage에 값을 저장하는 setter
    const setValue = useCallback(
        (value: T | ((prev: T) => T)) => {
            try {
                const valueToStore =
                    value instanceof Function ? value(storedValue) : value;
                setStoredValue(valueToStore);
                if (typeof window !== "undefined") {
                    window.localStorage.setItem(key, JSON.stringify(valueToStore));
                }
            } catch (error) {
                console.warn(`[useLocalStorage] Error setting key "${key}":`, error);
            }
        },
        [key, storedValue]
    );

    // localStorage에서 해당 키 삭제
    const removeValue = useCallback(() => {
        try {
            setStoredValue(initialValue);
            if (typeof window !== "undefined") {
                window.localStorage.removeItem(key);
            }
        } catch (error) {
            console.warn(`[useLocalStorage] Error removing key "${key}":`, error);
        }
    }, [key, initialValue]);

    // 다른 탭에서 localStorage가 변경될 때 동기화
    useEffect(() => {
        const handleStorageChange = (event: StorageEvent) => {
            if (event.key === key && event.newValue !== null) {
                try {
                    setStoredValue(JSON.parse(event.newValue) as T);
                } catch {
                    // 파싱 실패 시 무시
                }
            }
        };

        window.addEventListener("storage", handleStorageChange);
        return () => window.removeEventListener("storage", handleStorageChange);
    }, [key]);

    return [storedValue, setValue, removeValue];
}
