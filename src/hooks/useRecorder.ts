import { useState, useCallback } from "react";
import { setupRecorder, startRecording, stopRecording } from "../utils/record";

export type RecordingState = "idle" | "recording" | "processing";

export const useRecorder = () => {
    const [state, setState] = useState<RecordingState>("idle");

    const start = useCallback(async (stream: MediaStream) => {
        try {
            await setupRecorder(stream);
            startRecording();
            setState("recording");
        } catch (error) {
            console.error("Failed to start recording:", error);
            setState("idle");
        }
    }, []);

    const stop = useCallback(async () => {
        setState("processing");
        try {
            const transcript = await stopRecording();
            if (transcript) console.log("Transcription: ", transcript);
            return transcript;
        } catch (error) {
            console.error("Failed to stop recording:", error);
        } finally {
            setState("idle");
        }
    }, []);

    return {
        state,
        start,
        stop,
    };
};
