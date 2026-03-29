/**
 * 유틸리티 라이브러리 인덱스
 * 모든 유틸리티 모듈을 한 곳에서 낸냅니다
 */

// Core utilities - use specific imports to avoid conflicts
export * as utils from "./utils";
export * as utilsEnhanced from "./utils-enhanced";
export * as utilsCommon from "./utils-common";

// Storage
export * as storage from "./draft-storage";
export * as indexedDB from "./indexeddb-storage";

// State management
export * as undoRedo from "./undo-redo";
export * as versionManager from "./version-manager";

// Validation & Security
export * as validation from "./validation";
export * as security from "./gas-validator";

// UI & UX
export * as theme from "./theme";
export * as events from "./events";
export * as accessibility from "./accessibility";

// Data handling
export * as fileUtils from "./file-utils";
export * as collection from "./collection";
export * as stringUtils from "./string-utils";

// SEO & Performance
export * as seo from "./seo";
export * as performance from "./performance";

// Error handling & Logging
export * as errorHandling from "./error-handling";
export * as logger from "./logger";
export * as analytics from "./analytics";

// Internationalization & Date/Time
export * as i18n from "./i18n";
export * as datetime from "./datetime";

// Network
export * as network from "./network";

// Test utilities
export * as testUtils from "./test-utils";
