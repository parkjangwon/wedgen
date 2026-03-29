"use client";

import { useState, useCallback, useEffect } from "react";

interface UseDragAndDropOptions {
  onDragStart?: (id: string) => void;
  onDragEnd?: (id: string, newIndex: number) => void;
  onReorder?: (items: string[]) => void;
}

export function useDragAndDrop(options: UseDragAndDropOptions = {}) {
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);

  const handleDragStart = useCallback(
    (id: string) => {
      setDraggedId(id);
      options.onDragStart?.(id);
    },
    [options]
  );

  const handleDragOver = useCallback(
    (e: React.DragEvent, id: string) => {
      e.preventDefault();
      if (id !== draggedId) {
        setDragOverId(id);
      }
    },
    [draggedId]
  );

  const handleDragEnd = useCallback(() => {
    setDraggedId(null);
    setDragOverId(null);
  }, []);

  return {
    draggedId,
    dragOverId,
    handleDragStart,
    handleDragOver,
    handleDragEnd,
  };
}

interface UseClipboardOptions {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export function useClipboard(options: UseClipboardOptions = {}) {
  const [copied, setCopied] = useState(false);

  const copy = useCallback(
    async (text: string) => {
      try {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        options.onSuccess?.();

        setTimeout(() => {
          setCopied(false);
        }, 2000);
      } catch (error) {
        options.onError?.(error instanceof Error ? error : new Error("Copy failed"));
      }
    },
    [options]
  );

  return { copy, copied };
}

export function useImageUpload(options: {
  maxSize?: number;
  acceptedTypes?: string[];
  onError?: (error: Error) => void;
}) {
  const { maxSize = 5 * 1024 * 1024, acceptedTypes = ["image/*"], onError } = options;
  const [isUploading, setIsUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);

  const validateFile = useCallback(
    (file: File): boolean => {
      if (file.size > maxSize) {
        onError?.(new Error(`File size exceeds ${maxSize / 1024 / 1024}MB`));
        return false;
      }

      const isAccepted = acceptedTypes.some((type) => {
        if (type.endsWith("/*")) {
          return file.type.startsWith(type.replace("/*", ""));
        }
        return file.type === type;
      });

      if (!isAccepted) {
        onError?.(new Error("File type not accepted"));
        return false;
      }

      return true;
    },
    [maxSize, acceptedTypes, onError]
  );

  const upload = useCallback(
    async (file: File): Promise<string | null> => {
      if (!validateFile(file)) return null;

      setIsUploading(true);

      try {
        return new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            const result = reader.result as string;
            setPreview(result);
            setIsUploading(false);
            resolve(result);
          };
          reader.readAsDataURL(file);
        });
      } catch (error) {
        setIsUploading(false);
        onError?.(error instanceof Error ? error : new Error("Upload failed"));
        return null;
      }
    },
    [validateFile, onError]
  );

  const clear = useCallback(() => {
    setPreview(null);
  }, []);

  return {
    isUploading,
    preview,
    upload,
    clear,
  };
}
