import { useEffect } from "react";

export const useCameraLoop = (
    videoRef: React.RefObject<HTMLVideoElement | null>,
    canvasRef: React.RefObject<HTMLCanvasElement | null>,
    onDraw?: (ctx: CanvasRenderingContext2D, video: HTMLVideoElement) => void
) => {

    useEffect(() => {
        let animationFrameId: number;

        const draw = () => {
            const video = videoRef.current;
            const canvas = canvasRef.current;

            if (video && canvas) {
                if (video.readyState === 4) {
                    const ctx = canvas.getContext("2d", { willReadFrequently: true });
                    if (ctx) {
                        if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
                            canvas.width = video.videoWidth;
                            canvas.height = video.videoHeight;
                        }

                        ctx.save();
                        ctx.clearRect(0, 0, canvas.width, canvas.height);
                        ctx.scale(-1, 1);
                        ctx.translate(-canvas.width, 0);
                        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                        ctx.restore();

                        if (onDraw) {
                            onDraw(ctx, video);
                        }
                    }
                } else if (video.readyState < 2) {
                    // Optional: log if video is stuck in low readyState
                    // console.warn("Video not ready:", video.readyState);
                }
            }
            animationFrameId = requestAnimationFrame(draw);
        };

        animationFrameId = requestAnimationFrame(draw);
        return () => {
            cancelAnimationFrame(animationFrameId);
        };
    }, [onDraw]);

    return null;
};
