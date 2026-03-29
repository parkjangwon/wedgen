"use client";

import { useCallback, useEffect, useState } from "react";
import { UndoRedoManager } from "@/lib/undo-redo";

export function useUndoRedo<T>(initialState: T, maxHistory: number = 50) {
  const [manager] = useState(() => new UndoRedoManager<T>(maxHistory));
  const [state, setState] = useState<T>(initialState);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

  useEffect(() => {
    manager.execute(initialState);
    updateCapabilities();
  }, []);

  const updateCapabilities = useCallback(() => {
    setCanUndo(manager.canUndo());
    setCanRedo(manager.canRedo());
  }, [manager]);

  const execute = useCallback(
    (newState: T) => {
      manager.execute(newState);
      setState(newState);
      updateCapabilities();
    },
    [manager, updateCapabilities]
  );

  const undo = useCallback(() => {
    const newState = manager.undo();
    if (newState !== null) {
      setState(newState);
      updateCapabilities();
    }
  }, [manager, updateCapabilities]);

  const redo = useCallback(() => {
    const newState = manager.redo();
    if (newState !== null) {
      setState(newState);
      updateCapabilities();
    }
  }, [manager, updateCapabilities]);

  const clear = useCallback(() => {
    manager.clear();
    updateCapabilities();
  }, [manager, updateCapabilities]);

  return {
    state,
    canUndo,
    canRedo,
    execute,
    undo,
    redo,
    clear,
  };
}

export function useKeyboardShortcuts({
  onUndo,
  onRedo,
  onSave,
}: {
  onUndo?: () => void;
  onRedo?: () => void;
  onSave?: () => void;
}) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === "z") {
        event.preventDefault();
        if (event.shiftKey) {
          onRedo?.();
        } else {
          onUndo?.();
        }
      }

      if ((event.metaKey || event.ctrlKey) && event.key === "y") {
        event.preventDefault();
        onRedo?.();
      }

      if ((event.metaKey || event.ctrlKey) && event.key === "s") {
        event.preventDefault();
        onSave?.();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onUndo, onRedo, onSave]);
}
