import { useRef, useState, useCallback } from "react";
import Webcam from "react-webcam";

export const useWebcam = () => {
    const webcamRef = useRef<Webcam>(null);
    const [isReady, setIsReady] = useState(false);
    const [hasError, setHasError] = useState(false);

    const onUserMedia = useCallback(() => {
        setIsReady(true);
        setHasError(false);
    }, []);

    const onUserMediaError = useCallback((error: string | DOMException) => {
        console.error("Webcam error:", error);
        setIsReady(false);
        setHasError(true);
    }, []);

    return {
        webcamRef,
        isReady,
        hasError,
        onUserMedia,
        onUserMediaError,
    };
};
