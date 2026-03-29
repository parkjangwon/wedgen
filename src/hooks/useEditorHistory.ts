"use client";

import { useState, useCallback, useEffect } from "react";
import { UndoRedoManager } from "@/lib/undo-redo";

interface UseEditorHistoryOptions<T> {
  maxHistory?: number;
  debounceMs?: number;
}

export function useEditorHistory<T>(
  initialState: T,
  options: UseEditorHistoryOptions<T> = {}
) {
  const { maxHistory = 50, debounceMs = 500 } = options;

  const [manager] = useState(() => new UndoRedoManager<T>(maxHistory));
  const [state, setState] = useState<T>(initialState);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const [lastAction, setLastAction] = useState<string | null>(null);

  const updateCapabilities = useCallback(() => {
    setCanUndo(manager.canUndo());
    setCanRedo(manager.canRedo());
  }, [manager]);

  useEffect(() => {
    manager.execute(initialState);
    updateCapabilities();
  }, []);

  const execute = useCallback(
    (newState: T, actionName?: string) => {
      manager.execute(newState);
      setState(newState);
      setLastAction(actionName || null);
      updateCapabilities();
    },
    [manager, updateCapabilities]
  );

  const undo = useCallback(() => {
    const newState = manager.undo();
    if (newState !== null) {
      setState(newState);
      setLastAction("undo");
      updateCapabilities();
    }
  }, [manager, updateCapabilities]);

  const redo = useCallback(() => {
    const newState = manager.redo();
    if (newState !== null) {
      setState(newState);
      setLastAction("redo");
      updateCapabilities();
    }
  }, [manager, updateCapabilities]);

  const clear = useCallback(() => {
    manager.clear();
    setLastAction("clear");
    updateCapabilities();
  }, [manager, updateCapabilities]);

  return {
    state,
    canUndo,
    canRedo,
    lastAction,
    execute,
    undo,
    redo,
    clear,
  };
}
