import { useEffect, useMemo } from "react";
import { jutsuHelper } from "../utils/jutsu";

interface JutsuOverlayProps {
    isReady: boolean;
    currentJutsu: string;
    combination: string[];
    onReset?: () => void;
}

export default function JutsuOverlay({ isReady, currentJutsu, combination, onReset }: JutsuOverlayProps) {
    // Get expected hand signs for the current jutsu
    const expectedSigns = useMemo(() => {
        if (!currentJutsu) return [];
        return jutsuHelper(currentJutsu).split(" -> ");
    }, [currentJutsu]);

    // Check if each sign in the combination matches
    const getSignStatus = (sign: string, index: number): "match" | "mismatch" | "neutral" => {
        if (!currentJutsu || expectedSigns.length === 0) return "neutral";
        if (index >= expectedSigns.length) return "neutral";
        return sign.toLowerCase() === expectedSigns[index].toLowerCase() ? "match" : "mismatch";
    };

    // Check for mismatch and trigger reset
    useEffect(() => {
        if (!currentJutsu || combination.length === 0 || !onReset) return;

        // Check ALL signs for any mismatch
        const hasMismatch = combination.some((sign, index) =>
            getSignStatus(sign, index) === "mismatch"
        );

        if (hasMismatch) {
            // Small delay to show the red color before resetting
            const timer = setTimeout(() => {
                onReset();
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, [combination, currentJutsu, expectedSigns, onReset]);

    if (!isReady) return null;

    const getSignStyles = (status: "match" | "mismatch" | "neutral") => {
        switch (status) {
            case "match":
                return "bg-green-500/20 border-green-500/40 text-green-400";
            case "mismatch":
                return "bg-red-500/20 border-red-500/40 text-red-400";
            default:
                return "bg-indigo-500/20 border-indigo-500/30 text-indigo-300";
        }
    };

    return (
        <div className="absolute bottom-0 left-0 w-full bg-black/60 backdrop-blur-xl border-t border-white/10 py-3 px-8 flex flex-col gap-4 animate-in fade-in slide-in-from-bottom duration-500">
            <div className="flex gap-4">
                {currentJutsu ? (
                    <>
                        <div className="flex items-center">
                            <h3 className="text-orange-500 text-sm font-black tracking-tighter uppercase italic drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]">
                                {currentJutsu} :
                            </h3>
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <div className="flex items-center gap-2 flex-wrap">
                                {expectedSigns.map((sign, i) => (
                                    <div key={i} className="flex items-center gap-2">
                                        <span className="px-2 py-0.5 bg-orange-500/20 rounded-md border border-orange-500/40 text-orange-400 text-xs font-black shadow-[0_0_15px_rgba(249,115,22,0.1)]">
                                            {sign}
                                        </span>
                                        {i < expectedSigns.length - 1 && (
                                            <span className="text-white/30 text-xs">→</span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="py-1">
                        <p className="text-white/30 text-xs font-medium italic tracking-tight flex items-center gap-2">
                            <span className="w-1.5 h-1.5 bg-white/20 rounded-full animate-pulse" />
                            Standing by for voice command ...
                        </p>
                    </div>
                )}
            </div>

            {/* Current Input Window */}
            <div className="flex items-center gap-3 pt-3 border-t border-white/5">
                <span className="text-white/30 text-[9px] uppercase font-bold tracking-tighter flex-shrink-0">Hand Signs:</span>
                <div className="flex items-center gap-1.5 overflow-hidden">
                    {combination.length > 0 ? (
                        combination.map((sign, i) => {
                            const status = getSignStatus(sign, i);
                            return (
                                <div key={i} className="flex items-center gap-1.5 flex-shrink-0">
                                    <span className={`px-2 py-0.5 rounded border text-[10px] font-bold transition-colors duration-200 ${getSignStyles(status)}`}>
                                        {sign}
                                    </span>
                                    {i < combination.length - 1 && <span className="text-white/30 text-[8px]">→</span>}
                                </div>
                            );
                        })
                    ) : (
                        <span className="text-white/20 text-[10px] font-medium tracking-tight italic">Detecting hand signs ...</span>
                    )}
                </div>
            </div>
        </div>
    );
}
