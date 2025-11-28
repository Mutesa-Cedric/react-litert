import { LiteRtConfig, LiteRtProviderProps } from '@/types/public';
import React, { createContext, useContext, useMemo } from 'react';

const LiteRtContext = createContext<LiteRtConfig>({});

export const LiteRtProvider = ({ children, config }: LiteRtProviderProps) => {
  const stableConfig = useMemo(() => config || {}, [config]);

  return <LiteRtContext.Provider value={stableConfig}>{children}</LiteRtContext.Provider>;
};

export const useLiteRtConfig = () => {
  const context = useContext(LiteRtContext);
  if (!context) {
    throw new Error('useLiteRtContext must be used within a LiteRtProvider');
  }
  return context;
};
