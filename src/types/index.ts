/**
 * Centralized Type Definitions
 * All project types should be imported from here
 */

// Re-export all types from modules
export * from '@/lib/ai/providers';
export * from '@/lib/integrations/deepseek-harness';
export * from '@/lib/integrations/openhands';
export * from '@/lib/integrations/theia';
export * from '@/lib/tools/tools';
export * from '@/lib/tools/devtools';

// Common types
export type Timestamp = Date | string | number;

export interface BaseEntity {
  id: string;
  createdAt: Timestamp;
  updatedAt?: Timestamp;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// User types
export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  preferences: UserPreferences;
}

export interface UserPreferences {
  theme: 'dark' | 'light' | 'system';
  language: string;
  defaultProvider: string;
  defaultModel: string;
}

// Window types
export interface WindowBounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

export type WindowState = 'normal' | 'minimized' | 'maximized' | 'fullscreen';

// Event types
export interface AppEvent {
  type: string;
  payload: unknown;
  timestamp: Timestamp;
  source?: string;
}

// Utility types
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type RequireAtLeastOne<T, Keys extends keyof T = keyof T> = Pick<T, Exclude<keyof T, Keys>> & { [K in Keys]-?: Required<Pick<T, K>> & Partial<Pick<T, Exclude<Keys, K>>> }[Keys];
export type DeepPartial<T> = { [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P] };
