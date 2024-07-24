import { AssemblyAI } from "assemblyai";
const startBtn = document.getElementById("start-btn");
const stopBtn = document.getElementById("stop-btn");

let recorder, audio, audioChunks = [];

const client = new AssemblyAI({
    apiKey: "94bc45fc6e0a4eaea5e7c662d9d1d514",
});

navigator.mediaDevices.getUserMedia({ audio: true })
    .then((stream) => {
        recorder = new MediaRecorder(stream);
        recorder.ondataavailable = (event) => {
            audioChunks.push(event.data);
        };
        recorder.onstop = () => {
            const audioBlob = new Blob(audioChunks , { type: 'audio/wav'});
            const audioUrl = URL.createObjectURL(audioBlob);
            audio = new Audio(audioUrl);
            audio.play();

            const run = async () => {
                const params = {
                    audio: audioBlob,
                    language_code: 'ja',
                    punctuate: false,
                    format_text: false
                  }
                const transcript = await client.transcripts.transcribe(params);
                console.log(transcript.text);
                audioChunks = [];
            };
            run();
        };
    })
    .catch((error) => {
        console.error("Error accessing user-facing camera:", error);
    })

startBtn.addEventListener("click", () => {
    recorder.start();
});
stopBtn.addEventListener("click", () => {
    recorder.stop();
});