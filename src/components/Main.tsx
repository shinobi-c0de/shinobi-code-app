import { useRef, useCallback, useState, useEffect } from "react";

import RecordButton from "./RecordButton";
import CameraView from "./CameraView";
import JutsuOverlay from "./JutsuOverlay";
import { useWebcam } from "../hooks/useWebcam";
import { useRecorder } from "../hooks/useRecorder";
import { useCameraLoop } from "../hooks/useCameraLoop";
import { useModelContext } from "../context/ModelContext";

import { processFrame } from "../utils/inference";
import { drawBbox } from "../utils/draw";
import { labels_En, port } from "../utils/constants";
import { playHandSignSound, getJutsu } from "../utils/jutsu"
import { sendJutsu } from "../services/jutsu";
import { sharingan_keys } from "../utils/sharingan";


export default function Main() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const { webcamRef, isReady: webcamReady, hasError, onUserMedia, onUserMediaError } = useWebcam();
    const { state: recordingState, start: startRec, stop: stopRec } = useRecorder();
    const { isReady: modelsReady, mode } = useModelContext();

    const [currentJutsu, setCurrentJutsu] = useState<string>("");
    const [combination, setCombination] = useState<string[]>([]);
    const isInferenceRunning = useRef(false);
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const lastSignRef = useRef<string | null>(null); // Track last sign for audio deduplication
    const isSharingan = useRef(false);

    // Activity timeout tracking
    const activityTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const resetActivityTimer = useCallback(() => {
        if (activityTimerRef.current) {
            clearTimeout(activityTimerRef.current);
        }
        activityTimerRef.current = setTimeout(() => {
            setCombination([]);
            //setCurrentJutsu("");
            isSharingan.current = false;
            lastSignRef.current = null; // Reset last sign on timeout
        }, 10000); // 10 seconds
    }, []);

    // Cleanup timer on unmount
    useEffect(() => {
        return () => {
            if (activityTimerRef.current) {
                clearTimeout(activityTimerRef.current);
            }
        };
    }, []);

    // Jutsu Triggers
    useEffect(() => {
        const triggerJutsu = async () => {
            if (combination.length > 0 && currentJutsu) {
                const matched = await getJutsu(combination, currentJutsu);
                if (matched) {
                    if (sharingan_keys.includes(matched)) {
                        isSharingan.current = true;
                    }
                    // Success! Reset state after a short delay so user can see it
                    if (mode === "App") {
                        sendJutsu(matched, port);
                    }
                    setTimeout(() => {
                        //setCombination([]);
                        setCurrentJutsu("");
                        //lastSignRef.current = null; // Reset last sign on success
                    }, 8500); // To match the main timer
                }
            }
        };
        triggerJutsu();
    }, [combination, currentJutsu, mode]);

    // The Camera Loop! 
    const onDraw = useCallback(async (ctx: CanvasRenderingContext2D) => {
        if (modelsReady && !isInferenceRunning.current && canvasRef.current) {
            isInferenceRunning.current = true;
            try {
                // Run inference
                const detection = await processFrame(ctx, canvasRef.current, currentJutsu, isSharingan.current);

                // Draw detection boxes
                if (detection) {
                    const bbox = JSON.parse(detection.bbox);
                    const score = parseFloat(detection.score);
                    const classId = parseInt(detection.class_id);

                    // Only process if confidence is high
                    if (score > 0.8) {
                        drawBbox(ctx, bbox, classId);
                        const handSign = labels_En[classId + 1];

                        resetActivityTimer();

                        // Only play sound and update combination if it's a new sign
                        if (handSign !== lastSignRef.current) {
                            playHandSignSound();
                            lastSignRef.current = handSign;

                            setCombination(prev => {
                                if (prev.length === 0 || prev[prev.length - 1] !== handSign) {
                                    const next = [...prev, handSign];
                                    return next.slice(-15);
                                }
                                return prev;
                            });
                        }
                    } else {
                        // Reset lastSignRef when confidence drops, allowing re-detection of the same sign
                        lastSignRef.current = null;
                    }
                } else {
                    // Reset lastSignRef when no detection at all
                    lastSignRef.current = null;
                }
            } catch (err) {
                console.error("Inference Error:", err);
            } finally {
                isInferenceRunning.current = false;
            }
        }
    }, [modelsReady, currentJutsu, resetActivityTimer]);

    // Handle user media stream
    const handleUserMedia = useCallback((_stream: MediaStream) => {
        onUserMedia();
        if (webcamRef.current) {
            videoRef.current = webcamRef.current.video;
        }
    }, [onUserMedia, webcamRef]);

    useCameraLoop(videoRef, canvasRef, onDraw);

    const videoConstraints = {
        width: 1280,
        height: 720,
        facingMode: "user" as const,
    };

    const handleStart = () => {
        if (webcamRef.current?.stream) {
            setCurrentJutsu("");
            setCombination([]);
            startRec(webcamRef.current.stream);
        }
    };

    const handleStop = async () => {
        const transcript = await stopRec();
        if (transcript) {
            setCurrentJutsu(transcript.toLowerCase().trim());
        }
    };

    const isReady = webcamReady && modelsReady;

    return (
        <div className="hidden md:flex flex-col items-center min-h-screen p-4 w-full gap-8">
            <div className="relative w-full max-w-3xl aspect-video rounded-2xl overflow-hidden shadow-2xl border-4 border-indigo-500/30 bg-zinc-950">
                <CameraView
                    webcamRef={webcamRef}
                    canvasRef={canvasRef}
                    isReady={isReady}
                    hasError={hasError}
                    onUserMedia={handleUserMedia}
                    onUserMediaError={onUserMediaError}
                    videoConstraints={videoConstraints}
                />

                <JutsuOverlay
                    isReady={isReady}
                    currentJutsu={currentJutsu}
                    combination={combination}
                />
            </div>

            {/* Recording Controls */}
            <div className="flex flex-col items-center gap-6">
                <RecordButton
                    state={recordingState}
                    onStart={handleStart}
                    onStop={handleStop}
                />
                <p className="text-zinc-500 text-xs font-medium uppercase tracking-tighter">
                    {recordingState === "idle" ? "Press Sharingan to Record" :
                        recordingState === "recording" ? "Recording..." : "Transcribing audio ..."}
                </p>
            </div>
        </div>
    );
}
