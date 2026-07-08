"use client";

import React, { createContext, useContext, useCallback, useRef } from 'react';

interface PresetContextType {
  registerConfig: (
    getter: () => Record<string, unknown>,
    setter: (config: Record<string, unknown>) => void,
  ) => void;
}

const PresetContext = createContext<PresetContextType>({
  registerConfig: () => {},
});

export function usePresetContext() {
  return useContext(PresetContext);
}

export function createPresetProvider() {
  return function PresetProvider({ children, registerConfig }: { children: React.ReactNode; registerConfig: PresetContextType['registerConfig'] }) {
    return (
      <PresetContext.Provider value={{ registerConfig }}>
        {children}
      </PresetContext.Provider>
    );
  };
}

export { PresetContext };
