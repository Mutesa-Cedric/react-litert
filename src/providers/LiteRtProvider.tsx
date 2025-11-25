import { LiteRtConfig, LiteRtProviderProps } from "@/types/public";
import React, { createContext, useContext } from "react";


const LiteRtContext = createContext<LiteRtConfig>({});

export const LiteRtProvider = ({ children, config }: LiteRtProviderProps) => {
    return (
        <LiteRtContext.Provider value={config || {}}
        >
            {children}
        </LiteRtContext.Provider>
    )
}

export const useLiteRtConfig = () => {
    const context = useContext(LiteRtContext)
    if (!context) {
        throw new Error("useLiteRtContext must be used within a LiteRtProvider");
    }
    return context;
}