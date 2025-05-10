import { IMediaRecorder, MediaRecorder, register } from 'extendable-media-recorder';
import { connect } from 'extendable-media-recorder-wav-encoder';
import { speech2Text }  from '../api/speech2text';

const video = document.getElementById("video") as HTMLVideoElement;

let mediaRecorder: IMediaRecorder;
let audioChunks: Blob[] = []; // Array to store audio chunks

export async function setupRecorder() {
    await register(await connect());

    try {
        // Request microphone access
        const stream = await navigator.mediaDevices.getUserMedia({ 
            video: { facingMode: "user" }, 
            audio: { echoCancellation: true, } 
        });
        const videoStream = new MediaStream(stream.getVideoTracks());

        if (!video) {
            console.error("Video element not found in the document.");
            return;
        }
        video.srcObject = videoStream;
        video.play();

        const audioStream = new MediaStream(stream.getAudioTracks());
        // Create a MediaRecorder instance with WAV MIME type
        mediaRecorder = new MediaRecorder(audioStream, { 
            mimeType: 'audio/wav'
        });

        // Event handler for data available event
        mediaRecorder.ondataavailable = (event) => {
            audioChunks.push(event.data);
        };

    } catch (error) {
        console.error('Error accessing user-facing camera:', error);
    }
}

export function startRecording() {
    if(!mediaRecorder) return null;

    audioChunks = [];
    mediaRecorder.start();
}

export async function stopRecording() {
    if (!mediaRecorder) return null;

    return new Promise((resolve, reject) => {
        // Event handler for recording stopped
        mediaRecorder.onstop = async() => {
            // Create blob from the recorded chunks
            const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
            audioChunks = [];
            try {
                let speechText = await speech2Text(audioBlob);
                
                if (speechText != null) {
                    console.log("Speech Text: ", speechText);
                    resolve(speechText);
                }
            } catch (error) {
                console.error("Speech recognition error:", error);
                reject(error);
            }
        };
    
        mediaRecorder.stop();
    });
  }