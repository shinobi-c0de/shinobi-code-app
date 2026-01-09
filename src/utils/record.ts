import {
	type IMediaRecorder,
	MediaRecorder,
	register,
} from "extendable-media-recorder";
import { connect } from "extendable-media-recorder-wav-encoder";
import { speech2Text } from "../services/speech2text";

let mediaRecorder: IMediaRecorder;
let audioChunks: Blob[] = [];
let isRegistered = false;

/**
 * Initializes the recorder with a MediaStream.
 * Handles one-time registration of the WAV encoder.
 */
export async function setupRecorder(stream: MediaStream) {
	if (!isRegistered) {
		await register(await connect());
		isRegistered = true;
	}

	try {
		// Use audio tracks from the webcam/microphone stream
		const audioStream = new MediaStream(stream.getAudioTracks());

		mediaRecorder = new MediaRecorder(audioStream, {
			mimeType: "audio/wav",
		});

		mediaRecorder.ondataavailable = (event) => {
			if (event.data.size > 0) {
				audioChunks.push(event.data);
			}
		};
	} catch (error) {
		console.error("Failed to setup audio recorder:", error);
	}
}

/**
 * Starts the audio recording session.
 */
export function startRecording() {
	if (!mediaRecorder) throw new Error("MediaRecorder is not initialized.");

	audioChunks = [];
	mediaRecorder.start();
}

/**
 * Stops the recording and returns the transcribed text.
 */
export async function stopRecording(): Promise<string> {
	if (!mediaRecorder) throw new Error("MediaRecorder is not initialized.");

	return new Promise((resolve, reject) => {
		mediaRecorder.onstop = async () => {
			const audioBlob = new Blob(audioChunks, { type: "audio/wav" });
			audioChunks = [];

			try {
				const speechText = await speech2Text(audioBlob);
				if (speechText?.trim()) {
					console.log("Transcription:", speechText);
					resolve(speechText);
				} else {
					resolve("");
				}
			} catch (error) {
				console.error("Speech recognition failed:", error);
				reject(error);
			}
		};

		mediaRecorder.stop();
	});
}
