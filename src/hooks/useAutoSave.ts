"use client";

import { useState, useCallback, useEffect, useRef } from "react";

interface UseAutoSaveOptions {
  interval?: number;
  onSave?: () => void;
  enabled?: boolean;
}

export function useAutoSave(
  isDirty: boolean,
  options: UseAutoSaveOptions = {}
) {
  const { interval = 30000, onSave, enabled = true } = options;
  const [isSaving, setIsSaving] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const save = useCallback(async () => {
    if (!isDirty || isSaving) return;

    setIsSaving(true);
    setError(null);

    try {
      await onSave?.();
      setLastSavedAt(new Date());
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Save failed"));
    } finally {
      setIsSaving(false);
    }
  }, [isDirty, isSaving, onSave]);

  useEffect(() => {
    if (!enabled) return;

    timerRef.current = setInterval(() => {
      if (isDirty && !isSaving) {
        save();
      }
    }, interval);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [enabled, interval, isDirty, isSaving, save]);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty && !isSaving) {
        e.preventDefault();
        e.returnValue = "";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty, isSaving]);

  return {
    isSaving,
    lastSavedAt,
    error,
    save,
  };
}
