import { memo } from "react";
import Sharingan from "../assets/images/sharingan/sharingan_1.png";

export type RecordingState = "idle" | "recording" | "processing";

type RecordButtonProps = {
  state: RecordingState;
  onStart: () => void;
  onStop: () => void;
};

/**
 * A premium Sharingan-themed record button.
 * Optimized with React.memo to prevent unnecessary re-renders.
 */
const RecordButton = memo(({
  state,
  onStart,
  onStop,
}: RecordButtonProps) => {
  const isIdle = state === "idle";
  const isRecording = state === "recording";
  const isProcessing = state === "processing";

  const handleClick = () => {
    if (isProcessing) return;
    if (isRecording) {
      onStop();
    } else if (isIdle) {
      onStart();
    }
  };

  const getAriaLabel = () => {
    if (isRecording) return "Stop recording";
    if (isProcessing) return "Processing recording";
    return "Start recording";
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isProcessing}
      title={getAriaLabel()}
      aria-label={getAriaLabel()}
      aria-busy={isProcessing}
      className={`
        relative flex items-center justify-center
        h-20 w-20 rounded-full
        transition-all duration-500 ease-in-out
        focus:outline-none focus-visible:ring-4 focus-visible:ring-red-500/50
        ${isProcessing ? "opacity-40 cursor-not-allowed" : "hover:scale-110 active:scale-95 group"}
      `}
    >
      {/* Dynamic Glow Effect */}
      <div
        className={`
          absolute inset-0 rounded-full transition-all duration-700
          ${isRecording ? "bg-red-600/20 blur-xl scale-110 animate-pulse" : "bg-transparent blur-lg scale-90 group-hover:scale-100 group-hover:bg-red-500/10"}
        `}
      />

      {/* Sharingan Image */}
      <img
        src={Sharingan}
        alt=""
        aria-hidden
        className={`
          relative w-full h-full object-contain
          transition-all duration-700
          ${isRecording ? "animate-spin brightness-110 drop-shadow-[0_0_15px_rgba(220,38,38,0.8)]" : "drop-shadow-[0_0_8px_rgba(0,0,0,0.5)] brightness-90 group-hover:brightness-100"}
          ${isProcessing ? "grayscale opacity-50" : ""}
        `}
        style={isRecording ? { animationDuration: "2.5s" } : undefined}
      />

      {/* Inner Shadow/Ring for depth */}
      <div className={`
        absolute inset-0 rounded-full border-2 transition-colors duration-500
        ${isRecording ? "border-red-500/40" : "border-transparent group-hover:border-red-500/20"}
      `} />

      {/* Processing State Indicator */}
      {isProcessing && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-12 h-12 border-2 border-white/10 border-t-white/40 rounded-full animate-spin" />
        </div>
      )}
    </button>
  );
});

RecordButton.displayName = "RecordButton";
export default RecordButton;
