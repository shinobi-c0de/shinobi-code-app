import { jutsuHelper } from "../utils/jutsu";

interface JutsuOverlayProps {
    isReady: boolean;
    currentJutsu: string;
    combination: string[];
}

export default function JutsuOverlay({ isReady, currentJutsu, combination }: JutsuOverlayProps) {
    if (!isReady) return null;

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
                                {jutsuHelper(currentJutsu).split(" -> ").map((sign, i) => (
                                    <div key={i} className="flex items-center gap-2">
                                        <span className="px-2 py-0.5 bg-orange-500/20 rounded-md border border-orange-500/40 text-orange-400 text-xs font-black shadow-[0_0_15px_rgba(249,115,22,0.1)]">
                                            {sign}
                                        </span>
                                        {i < jutsuHelper(currentJutsu).split(" -> ").length - 1 && (
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
                        combination.map((sign, i) => (
                            <div key={i} className="flex items-center gap-1.5 flex-shrink-0">
                                <span className="px-2 py-0.5 bg-indigo-500/20 rounded border border-indigo-500/30 text-indigo-300 text-[10px] font-bold">
                                    {sign}
                                </span>
                                {i < combination.length - 1 && <span className="text-white/20 text-[8px]">→</span>}
                            </div>
                        ))
                    ) : (
                        <span className="text-white/20 text-[10px] font-medium tracking-tight italic">Detecting hand signs ...</span>
                    )}
                </div>
            </div>
        </div>
    );
}
