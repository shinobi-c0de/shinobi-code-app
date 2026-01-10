
import React, { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { init_models, init_wasm } from '../utils';
import { checkPort } from '../helpers';
import { port, message } from '../utils/constants';

interface ModelContextType {
    isReady: boolean;
    isLoading: boolean;
    error: string | null;
    mode: string;
}

const ModelContext = createContext<ModelContextType | undefined>(undefined);

export const ModelProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [isReady, setIsReady] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [mode, setMode] = useState<string>("Closed");

    useEffect(() => {
        let mounted = true;

        // Detect mobile device
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
            navigator.userAgent
        ) || window.innerWidth < 768;

        const loadModels = async () => {
            // Prevent double loading if already loaded or loading
            if (isReady || isLoading) return;

            setIsLoading(true);
            try {
                // Skip initialization, if mobile
                if (isMobile) {
                    if (mounted) {
                        setMode("Mobile");
                        setIsReady(true);
                        setIsLoading(false);
                    }
                    return;
                }

                // Initialize WASM first
                init_wasm();

                // Initialize Models
                await init_models();

                // Check extension connection
                const Mode = await checkPort(port, message);

                if (mounted) {
                    setMode(Mode);
                    setIsReady(true);
                    setIsLoading(false);
                }
            } catch (err: unknown) {
                if (!mounted) return;
    
                console.error("Model initialization failed:", err);
                setError(err instanceof Error ? err.message : "Failed to load models");
                setIsLoading(false);
            }
        };

        loadModels();

        return () => {
            mounted = false;
        };
    }, []); // Run once on mount

    return (
        <ModelContext.Provider value={{ isReady, isLoading, error, mode }}>
            {children}
        </ModelContext.Provider>
    );
};

export const useModelContext = () => {
    const context = useContext(ModelContext);
    if (context === undefined) {
        throw new Error('useModelContext must be used within a ModelProvider');
    }
    return context;
};
