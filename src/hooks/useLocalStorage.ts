import { useState, useEffect, useRef, useCallback } from "react";

function useLocalStorage<T>(key: string, fallback: T): [T, (val: T | ((prev: T) => T)) => void] {
  const [state, setState] = useState<T>(() => {
    try {
      const raw = localStorage.getItem(key);
      return raw !== null ? (JSON.parse(raw) as T) : fallback;
    } catch {
      return fallback;
    }
  });

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const setValue = useCallback((val: T | ((prev: T) => T)) => {
    setState((prev) => {
      const next = typeof val === "function" ? (val as (p: T) => T)(prev) : val;
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        try {
          localStorage.setItem(key, JSON.stringify(next));
        } catch {
          // storage full or blocked — silently ignore
        }
      }, 300);
      return next;
    });
  }, [key]);

  useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current); }, []);

  return [state, setValue];
}

export default useLocalStorage;
