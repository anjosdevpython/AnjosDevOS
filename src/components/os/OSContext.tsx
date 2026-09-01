'use client';

import React, { createContext, useContext, useState, useCallback, useMemo, ReactNode } from 'react';
import { WindowState, AppDefinition, APP_DEFINITIONS } from './types';
import { getOSContextAdapter } from '@/application/os';

export interface OSContextType {
  windows: WindowState[];
  activeWindowId: string | null;
  isStartMenuOpen: boolean;
  isBooted: boolean;
  openApp: (appId: string) => void;
  closeWindow: (windowId: string) => void;
  minimizeWindow: (windowId: string) => void;
  toggleMaximize: (windowId: string) => void;
  focusWindow: (windowId: string) => void;
  moveWindow: (windowId: string, x: number, y: number) => void;
  resizeWindow: (windowId: string, width: number, height: number) => void;
  setStartMenuOpen: (open: boolean) => void;
  setBooted: (booted: boolean) => void;
  getAppDef: (appId: string) => AppDefinition | undefined;
}

const OSContext = createContext<OSContextType | null>(null);

export function useOS() {
  const ctx = useContext(OSContext);
  if (!ctx) throw new Error('useOS must be used within OSProvider');
  return ctx;
}

let zIndexCounter = 100;
let windowCounter = 0;

export function OSProvider({ children }: { children: ReactNode }) {
  const [windows, setWindows] = useState<WindowState[]>([]);
  const [activeWindowId, setActiveWindowId] = useState<string | null>(null);
  const [isStartMenuOpen, setStartMenuOpen] = useState(false);
  const [isBooted, setBooted] = useState(false);

  const getAppDef = useCallback((appId: string) => {
    return APP_DEFINITIONS.find((a) => a.id === appId);
  }, []);

  const openApp = useCallback((appId: string) => {
    const appDef = APP_DEFINITIONS.find((a) => a.id === appId);
    if (!appDef) return;

    // Check if already open (not minimized) — focus it
    const existing = windows.find((w) => w.appId === appId && !w.isMinimized);
    if (existing) {
      focusWindow(existing.id);
      setStartMenuOpen(false);
      return;
    }

    // Check if minimized — restore it
    const minimized = windows.find((w) => w.appId === appId && w.isMinimized);
    if (minimized) {
      setWindows((prev) =>
        prev.map((w) =>
          w.id === minimized.id ? { ...w, isMinimized: false, zIndex: ++zIndexCounter } : w
        )
      );
      setActiveWindowId(minimized.id);
      setStartMenuOpen(false);
      return;
    }

    windowCounter++;
    const offset = (windowCounter % 8) * 30;
    const newWindow: WindowState = {
      id: `window-${Date.now()}-${windowCounter}`,
      appId,
      title: appDef.title,
      x: 80 + offset,
      y: 40 + offset,
      width: appDef.defaultWidth,
      height: appDef.defaultHeight,
      minWidth: appDef.minWidth,
      minHeight: appDef.minHeight,
      isMinimized: false,
      isMaximized: false,
      zIndex: ++zIndexCounter,
    };

    setWindows((prev) => [...prev, newWindow]);
    setActiveWindowId(newWindow.id);
    setStartMenuOpen(false);
  }, [windows]);

  const closeWindow = useCallback((windowId: string) => {
    setWindows((prev) => prev.filter((w) => w.id !== windowId));
    setActiveWindowId((prev) => (prev === windowId ? null : prev));
  }, []);

  const minimizeWindow = useCallback((windowId: string) => {
    setWindows((prev) =>
      prev.map((w) => (w.id === windowId ? { ...w, isMinimized: true } : w))
    );
    setActiveWindowId((prev) => (prev === windowId ? null : prev));
  }, []);

  const toggleMaximize = useCallback((windowId: string) => {
    setWindows((prev) =>
      prev.map((w) => {
        if (w.id !== windowId) return w;
        if (w.isMaximized) {
          // Restore
          return {
            ...w,
            isMaximized: false,
            x: w.prevBounds?.x ?? 80,
            y: w.prevBounds?.y ?? 40,
            width: w.prevBounds?.width ?? w.minWidth + 200,
            height: w.prevBounds?.height ?? w.minHeight + 200,
            prevBounds: undefined,
            zIndex: ++zIndexCounter,
          };
        } else {
          // Maximize
          return {
            ...w,
            isMaximized: true,
            prevBounds: { x: w.x, y: w.y, width: w.width, height: w.height },
            x: 0,
            y: 0,
            width: window.innerWidth,
            height: window.innerHeight - 48, // taskbar height
            zIndex: ++zIndexCounter,
          };
        }
      })
    );
    setActiveWindowId(windowId);
  }, []);

  const focusWindow = useCallback((windowId: string) => {
    setWindows((prev) =>
      prev.map((w) =>
        w.id === windowId ? { ...w, zIndex: ++zIndexCounter, isMinimized: false } : w
      )
    );
    setActiveWindowId(windowId);
  }, []);

  const moveWindow = useCallback((windowId: string, x: number, y: number) => {
    setWindows((prev) =>
      prev.map((w) => (w.id === windowId ? { ...w, x, y, isMaximized: false } : w))
    );
  }, []);

  const resizeWindow = useCallback((windowId: string, width: number, height: number) => {
    setWindows((prev) =>
      prev.map((w) => {
        if (w.id !== windowId) return w;
        return {
          ...w,
          width: Math.max(width, w.minWidth),
          height: Math.max(height, w.minHeight),
          isMaximized: false,
        };
      })
    );
  }, []);

  // --- Integração gradual com o Event Bus (Fase 1) -------------------------
  // O adapter apenas envelopa os callbacks: o comportamento original é sempre
  // executado. Os wrappers são memoizados para preservar a identidade das
  // funções (BootScreen depende de `setBooted` estável no array de deps).
  const osEventsAdapter = useMemo(() => getOSContextAdapter(), []);

  const observedOpenApp = useMemo(
    () => osEventsAdapter.wrapOpenApp(openApp),
    [osEventsAdapter, openApp]
  );
  const observedCloseWindow = useMemo(
    () => osEventsAdapter.wrapCloseWindow(closeWindow),
    [osEventsAdapter, closeWindow]
  );
  const observedSetBooted = useMemo(
    () => osEventsAdapter.wrapSetBooted(setBooted),
    [osEventsAdapter]
  );

  return (
    <OSContext.Provider
      value={{
        windows,
        activeWindowId,
        isStartMenuOpen,
        isBooted,
        openApp: observedOpenApp,
        closeWindow: observedCloseWindow,
        minimizeWindow,
        toggleMaximize,
        focusWindow,
        moveWindow,
        resizeWindow,
        setStartMenuOpen,
        setBooted: observedSetBooted,
        getAppDef,
      }}
    >
      {children}
    </OSContext.Provider>
  );
}
