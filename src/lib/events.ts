export const EVENTS = {
  EDITOR: {
    DRAFT_SAVED: "editor:draft:saved",
    DRAFT_LOADED: "editor:draft:loaded",
    DRAFT_RESET: "editor:draft:reset",
    SECTION_ADDED: "editor:section:added",
    SECTION_REMOVED: "editor:section:removed",
    SECTION_REORDERED: "editor:section:reordered",
    FIELD_UPDATED: "editor:field:updated",
    ASSET_UPLOADED: "editor:asset:uploaded",
    PREVIEW_REFRESHED: "editor:preview:refreshed",
    BUILD_STARTED: "editor:build:started",
    BUILD_COMPLETED: "editor:build:completed",
    BUILD_FAILED: "editor:build:failed",
  },
  TEMPLATE: {
    SELECTED: "template:selected",
    CHANGED: "template:changed",
    PREVIEW_OPENED: "template:preview:opened",
  },
  UI: {
    MODAL_OPENED: "ui:modal:opened",
    MODAL_CLOSED: "ui:modal:closed",
    NOTIFICATION_SHOWN: "ui:notification:shown",
    THEME_CHANGED: "ui:theme:changed",
  },
};

export function emitEvent(eventName: string, detail?: unknown) {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(eventName, { detail }));
  }
}

export function onEvent(
  eventName: string,
  handler: (event: CustomEvent) => void
) {
  if (typeof window !== "undefined") {
    window.addEventListener(eventName, handler as EventListener);
  }
}

export function offEvent(
  eventName: string,
  handler: (event: CustomEvent) => void
) {
  if (typeof window !== "undefined") {
    window.removeEventListener(eventName, handler as EventListener);
  }
}
