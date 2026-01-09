import type { RefObject } from "react";
import Webcam from "react-webcam";

interface CameraViewProps {
    webcamRef: RefObject<Webcam | null>;
    canvasRef: RefObject<HTMLCanvasElement | null>;
    isReady: boolean;
    hasError: boolean;
    onUserMedia: (stream: MediaStream) => void;
    onUserMediaError: (error: string | DOMException) => void;
    videoConstraints: {
        width: number;
        height: number;
        facingMode: "user" | "environment";
    };
}

export default function CameraView({
    webcamRef,
    canvasRef,
    isReady,
    hasError,
    onUserMedia,
    onUserMediaError,
    videoConstraints
}: CameraViewProps) {
    return (
        <div className="relative w-full h-full">
            {/* HIDDEN WEBCAM FEED */}
            <div className="absolute top-0 left-0 opacity-0 pointer-events-none">
                <Webcam
                    audio={true}
                    muted={true}
                    ref={webcamRef}
                    onUserMedia={onUserMedia}
                    onUserMediaError={onUserMediaError}
                    videoConstraints={videoConstraints}
                    width={videoConstraints.width}
                    height={videoConstraints.height}
                    mirrored={true}
                />
            </div>

            {/* VISIBLE SYNCED CANVAS */}
            <canvas
                ref={canvasRef}
                id="canvas"
                className={`w-full h-full object-cover transition-opacity duration-700 ${isReady ? 'opacity-100' : 'opacity-0'}`}
            />

            {/* Placeholder/Loading State */}
            {!isReady && !hasError && (
                <div className="absolute inset-0 flex items-center justify-center bg-zinc-900 z-10 text-indigo-400">
                    <div className="flex flex-col items-center gap-3">
                        <div className="w-8 h-8 border-4 border-current border-t-transparent rounded-full animate-spin" />
                        <p className="text-sm font-medium animate-pulse">
                            Initializing...
                        </p>
                    </div>
                </div>
            )}

            {/* Status Badge */}
            {isReady && (
                <div className="absolute top-4 right-6 flex items-center gap-2 px-3 py-1.5 bg-black/40 backdrop-blur-md rounded-full border border-white/10 text-white text-[10px] uppercase tracking-widest font-bold">
                    <span className="w-2 h-2 bg-green-500 rounded-full" />
                    Live
                </div>
            )}

            {hasError && (
                <div className="absolute top-4 right-6 flex items-center gap-2 px-3 py-1.5 bg-black/40 backdrop-blur-md rounded-full border border-red-500/20 text-red-400 text-[10px] uppercase tracking-widest font-bold">
                    <span className="w-2 h-2 bg-red-500 rounded-full" />
                    Offline
                </div>
            )}

            <div className="absolute top-4 left-6 pointer-events-none">
                <span className="text-indigo-400/80 text-[10px] font-black tracking-[0.3em] uppercase drop-shadow-sm">

                </span>
            </div>
        </div>
    );
}
