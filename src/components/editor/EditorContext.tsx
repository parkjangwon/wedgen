"use client";

import {
  createContext,
  useContext,
  useReducer,
  useCallback,
  useMemo,
  type ReactNode,
} from "react";
import type { WedgenConfigData, WedgenConfigStyle, WedgenConfigAssets } from "@/types";

interface EditorDraft {
  locale: string;
  sectionOrder: string[];
  data: WedgenConfigData;
  style: WedgenConfigStyle;
  assets: WedgenConfigAssets;
  files: Record<string, File | File[] | undefined>;
}

interface EditorState {
  draft: EditorDraft;
  draftVersion: number;
  savedVersion: number;
  isDirty: boolean;
  storageSlot: 1 | 2 | 3;
  slotNames: Record<1 | 2 | 3, string>;
  isSaving: boolean;
  lastSavedAt: number | null;
  pendingTemplateId: string | null;
}

type EditorAction =
  | { type: "UPDATE_DATA"; field: string; value: unknown }
  | { type: "UPDATE_STYLE"; field: string; value: string }
  | { type: "UPDATE_ASSETS"; field: string; value: string | string[] | undefined }
  | { type: "UPDATE_FILES"; field: string; value: File | File[] | undefined }
  | { type: "UPDATE_SECTION_ORDER"; order: string[] }
  | { type: "SET_STORAGE_SLOT"; slot: 1 | 2 | 3 }
  | { type: "SET_SLOT_NAME"; slot: 1 | 2 | 3; name: string }
  | { type: "SET_PENDING_TEMPLATE"; templateId: string | null }
  | { type: "MARK_SAVED"; timestamp: number }
  | { type: "RESTORE_DRAFT"; draft: EditorDraft }
  | { type: "RESET_DRAFT"; draft: EditorDraft }
  | { type: "SET_DIRTY"; isDirty: boolean };

function createInitialDraft(templateId: string): EditorDraft {
  return {
    locale: "ko",
    sectionOrder: ["hero", "greeting", "family", "gallery", "schedule", "location", "account", "guestbook", "ending"],
    data: {} as WedgenConfigData,
    style: {} as WedgenConfigStyle,
    assets: {} as WedgenConfigAssets,
    files: {},
  };
}

function editorReducer(state: EditorState, action: EditorAction): EditorState {
  switch (action.type) {
    case "UPDATE_DATA":
      return {
        ...state,
        draft: {
          ...state.draft,
          data: { ...state.draft.data, [action.field]: action.value },
        },
        draftVersion: state.draftVersion + 1,
      };

    case "UPDATE_STYLE":
      return {
        ...state,
        draft: {
          ...state.draft,
          style: { ...state.draft.style, [action.field]: action.value },
        },
        draftVersion: state.draftVersion + 1,
      };

    case "UPDATE_ASSETS":
      return {
        ...state,
        draft: {
          ...state.draft,
          assets: { ...state.draft.assets, [action.field]: action.value },
        },
        draftVersion: state.draftVersion + 1,
      };

    case "UPDATE_FILES":
      return {
        ...state,
        draft: {
          ...state.draft,
          files: { ...state.draft.files, [action.field]: action.value },
        },
        draftVersion: state.draftVersion + 1,
      };

    case "UPDATE_SECTION_ORDER":
      return {
        ...state,
        draft: { ...state.draft, sectionOrder: action.order },
        draftVersion: state.draftVersion + 1,
      };

    case "SET_STORAGE_SLOT":
      return { ...state, storageSlot: action.slot };

    case "SET_SLOT_NAME":
      return {
        ...state,
        slotNames: { ...state.slotNames, [action.slot]: action.name },
      };

    case "SET_PENDING_TEMPLATE":
      return { ...state, pendingTemplateId: action.templateId };

    case "MARK_SAVED":
      return { ...state, savedVersion: state.draftVersion, isSaving: false, lastSavedAt: action.timestamp };

    case "RESTORE_DRAFT":
      return { ...state, draft: action.draft, draftVersion: state.draftVersion + 1, savedVersion: state.draftVersion + 1 };

    case "RESET_DRAFT":
      return { ...state, draft: action.draft, draftVersion: state.draftVersion + 1, savedVersion: state.draftVersion + 1 };

    case "SET_DIRTY":
      return { ...state, draftVersion: state.savedVersion + (action.isDirty ? 1 : 0) };

    default:
      return state;
  }
}

interface EditorContextValue {
  state: EditorState;
  dispatch: React.Dispatch<EditorAction>;
  updateData: (field: string, value: unknown) => void;
  updateStyle: (field: string, value: string) => void;
  updateAssets: (field: string, value: string | string[] | undefined) => void;
  updateFiles: (field: string, value: File | File[] | undefined) => void;
  updateSectionOrder: (order: string[]) => void;
  setStorageSlot: (slot: 1 | 2 | 3) => void;
  setSlotName: (slot: 1 | 2 | 3, name: string) => void;
  setPendingTemplate: (templateId: string | null) => void;
  markSaved: () => void;
  restoreDraft: (draft: EditorDraft) => void;
  resetDraft: (draft: EditorDraft) => void;
}

const EditorContext = createContext<EditorContextValue | null>(null);

export function useEditor() {
  const context = useContext(EditorContext);
  if (!context) {
    throw new Error("useEditor must be used within EditorProvider");
  }
  return context;
}

interface EditorProviderProps {
  children: ReactNode;
  templateId: string;
  initialDraft?: Partial<EditorDraft>;
}

export function EditorProvider({
  children,
  templateId,
  initialDraft,
}: EditorProviderProps) {
  const [state, dispatch] = useReducer(editorReducer, null, () => ({
    draft: { ...createInitialDraft(templateId), ...initialDraft },
    draftVersion: 0,
    savedVersion: 0,
    isDirty: false,
    storageSlot: 1 as const,
    slotNames: { 1: "예식 초안 A", 2: "예식 초안 B", 3: "예식 초안 C" },
    isSaving: false,
    lastSavedAt: null,
    pendingTemplateId: null,
  }));

  const updateData = useCallback((field: string, value: unknown) => {
    dispatch({ type: "UPDATE_DATA", field, value });
  }, []);

  const updateStyle = useCallback((field: string, value: string) => {
    dispatch({ type: "UPDATE_STYLE", field, value });
  }, []);

  const updateAssets = useCallback((field: string, value: string | string[] | undefined) => {
    dispatch({ type: "UPDATE_ASSETS", field, value });
  }, []);

  const updateFiles = useCallback((field: string, value: File | File[] | undefined) => {
    dispatch({ type: "UPDATE_FILES", field, value });
  }, []);

  const updateSectionOrder = useCallback((order: string[]) => {
    dispatch({ type: "UPDATE_SECTION_ORDER", order });
  }, []);

  const setStorageSlot = useCallback((slot: 1 | 2 | 3) => {
    dispatch({ type: "SET_STORAGE_SLOT", slot });
  }, []);

  const setSlotName = useCallback((slot: 1 | 2 | 3, name: string) => {
    dispatch({ type: "SET_SLOT_NAME", slot, name });
  }, []);

  const setPendingTemplate = useCallback((templateId: string | null) => {
    dispatch({ type: "SET_PENDING_TEMPLATE", templateId });
  }, []);

  const markSaved = useCallback(() => {
    dispatch({ type: "MARK_SAVED", timestamp: Date.now() });
  }, []);

  const restoreDraft = useCallback((draft: EditorDraft) => {
    dispatch({ type: "RESTORE_DRAFT", draft });
  }, []);

  const resetDraft = useCallback((draft: EditorDraft) => {
    dispatch({ type: "RESET_DRAFT", draft });
  }, []);

  const value = useMemo(
    () => ({
      state: {
        ...state,
        isDirty: state.draftVersion !== state.savedVersion,
      },
      dispatch,
      updateData,
      updateStyle,
      updateAssets,
      updateFiles,
      updateSectionOrder,
      setStorageSlot,
      setSlotName,
      setPendingTemplate,
      markSaved,
      restoreDraft,
      resetDraft,
    }),
    [
      state,
      updateData,
      updateStyle,
      updateAssets,
      updateFiles,
      updateSectionOrder,
      setStorageSlot,
      setSlotName,
      setPendingTemplate,
      markSaved,
      restoreDraft,
      resetDraft,
    ],
  );

  return <EditorContext.Provider value={value}>{children}</EditorContext.Provider>;
}
