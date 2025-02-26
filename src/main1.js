import * as ort from "onnxruntime-web"
import init from "./pkg"
import {setupRecorder, startRecording, stopRecording} from "./utils/record";
import {deque} from "./utils/deque";
import { createFaceLandmarker } from "./utils/utils";

import { jutsuHelper } from "./utils/jutsu";
import {processFrame}  from "./process";

//import { deque, labels_En, labels_symbol, addLog, speech2Text, getJutsu } from './utils/utils';



//Worker
const worker = new Worker(new URL("./worker.js", import.meta.url), { type: "module" });
let isWorkerReady = false;

const optionsButton = document.getElementById("optionsButton");

const video = document.getElementById("video");
const recordButton = document.getElementById("recordButton");
const image = document.getElementById("image");

const StatusMsg = document.getElementById("StatusMsg");
const jutsuHelp = document.getElementById("jutsuHelp");
const handSigns = document.getElementById("handSigns");

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d', {willReadFrequently: true});

let Mode, Message, Port;
let isRecording, isActive;
let Session, inputName, outputName;
let speechText, timeout, jutsu, Jutsu;

//Iris
let faceLandmarker;

//time based variables
let record_start_time, record_interval;
let sign_interval, sign_start_time;
let sign_display_queue,sign_history_queue,sign_display_arr,sign_display;
let jutsu_display_time, jutsu_start_time, jutsu_display;

let audio = new Audio('audio/hand_sign.mp3');


// Handle messages from worker
worker.onmessage = function (e) {
    if (e.data.type === "result") {
        console.log("Inference result:", e.data.result);
    } else if (e.data.type === "error") {
        console.error("Worker error:", e.data.message);
    }
};

async function init_model() {
    StatusMsg.textContent = "Initializing models...";

    let model_path = "/models/yolox_nano_with_post.onnx";
    // Initialize ONNX model inside worker
    worker.postMessage({
        type: "init",
        modelPath: model_path
    });

    // Wait for the worker to be ready
    Session = await new Promise(resolve => {
        worker.onmessage = function (e) {
            if (e.data.type === "ready") {
                console.log("Worker is ready!");
                isWorkerReady = true;
                resolve(e.data.Session);  // ✅ Resolve the promise here
            }
        };
    });

    faceLandmarker = await createFaceLandmarker();
    if (faceLandmarker) console.log("Iris detection model loaded.");
    if (Session) console.log("HandSign detection model loaded.");

    if (Session && faceLandmarker) {
        StatusMsg.textContent = "Ready to go! Click Record button";
    }
}

async function setup() {
    Port = import.meta.env.VITE_Port;
    Message = import.meta.env.VITE_Message;

    setupRecorder();

    const mainContent = document.querySelector('.container');
    if (window.innerWidth >= 1024) {
        mainContent.style.display = 'flex'; // Display Main content

        // Check if Jutsu data need to be send to extension
        let data = '';

        try {
            let response = await fetch(`http://localhost:${Port}/`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            data = await response.json();
            if ( data.message == Message) {
                Mode = 'App';
            }
        } catch (error) {
            console.error(error);
        }
        
    }
    else {
        alert("Shinobi Code is only accessible on a laptop or desktop device.");
        return;
    }

    await init_model();   

    init().then(() => {console.log("WASM Initialized.")});

    sign_display_queue = new deque(15);
    sign_history_queue = new deque(15);

    record_interval = 3;
    sign_interval = 3;
    jutsu_display_time = 3;
    sign_start_time = 0;
    jutsu_start_time = 0;
    timeout = 30;
    sign_display = '';
    jutsu_display = '';

}

async function StopRecording() {
    speechText = await stopRecording();
    
    if (speechText != null) {
        StatusMsg.textContent = `You said : ${speechText}`;
        //addLog(`Speech Engine detected: ${speechText}`);
        //console.log("Speech Text: ", speechText);

        let handsigns_display = jutsuHelper(speechText);
        jutsuHelp.textContent = `Hand Signs for ${speechText}: `;
        handSigns.textContent = ` ${handsigns_display}`;
        jutsuHelp.appendChild(handSigns);
        handsigns_display = "";
    }
}

document.addEventListener('DOMContentLoaded', async() => {
    //Set canvas dimensions
    canvas.width = video.width;
    canvas.height = video.height;
    console.log("Canvas Dims: ", canvas.width, canvas.height);
    
    await setup();
})

video.addEventListener('play', () => {

    const process = async() => {

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.save();
        ctx.scale(-1, 1); // Flip horizontally
        ctx.drawImage(video, -canvas.width, 0, canvas.width, canvas.height);
        ctx.restore();
        
        //Footer Box
        ctx.fillStyle = 'black';
        ctx.fillRect(0, canvas.height-40, canvas.width, 40); // Rectangle position (x, y) and size (width, height)

        if(isRecording && isWorkerReady) {
            const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const imgArray = new Uint8Array(imgData.data);

            const imgDim = [imgData.width, imgData.height];
            const canvasDim = [canvas.width, canvas.height];

            worker.postMessage({ type: "processFrame", imgArray, imgDim, canvasDim });


            if(jutsu_display) {
                ctx.fillStyle = 'white';
                ctx.font = '20px njnaruto';
                ctx.fillText(jutsu_display, 20, canvas.height-10);
            }
            else {
                ctx.fillStyle = 'white';
                ctx.font = '20px njnaruto';
                ctx.fillText(sign_display, 20, canvas.height-10); 
            }

            if ((Math.floor(Date.now() / 1000) - record_start_time) > record_interval) {
                StopRecording();
            }
            if ((Math.floor(Date.now() / 1000) - sign_start_time) > sign_interval) {
                sign_display_queue.clear();
                sign_history_queue.clear();
                sign_display_arr = [];
                sign_display = '';
            }
            if ((Math.floor(Date.now() / 1000) - jutsu_start_time) > jutsu_display_time) {
                jutsu_display = '';
            }
            if(sign_start_time !== 0) {
                if (Math.floor(Date.now() / 1000) - sign_start_time > timeout) {
                    sign_start_time = 0;
                    jutsu_start_time = 0;
                    //When testing, comment below line
                    recordButton.click();
                }
            }
        }

        requestAnimationFrame(process);
    };

   process();
});

optionsButton.addEventListener("click", () => {
    if (!isActive) {
        isActive = true;
        optionsButton.classList.add('active');
    }
    else {
        isActive = false;
        optionsButton.classList.remove('active');
    }
})


recordButton.addEventListener("click", async () => {
    if (!isRecording) {
        isRecording = true;

        image.src = 'images/shinobi-red.png';
        image.classList.add('Rec');
        canvas.classList.add('rec-border');   
        speechText = "";
        if (!speechText) {
            StatusMsg.textContent = "Listening... Say a Jutsu name and do handsigns";
            startRecording();
            record_start_time = Math.floor(Date.now() / 1000);
        }
    }
    else {
        isRecording = false;

        image.classList.remove('Rec');
        canvas.classList.remove('rec-border');
        image.src = 'images/shinobi-dark.png';

        sign_start_time = 0;
        jutsu_start_time = 0;
        jutsu = '';
        Jutsu = '';
        StatusMsg.textContent = "";
        jutsuHelp.textContent = "";
        handSigns.textContent = "";
    }
});



