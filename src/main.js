import * as ort from "onnxruntime-web"
import init, {preprocess, postprocess} from "./pkg"
import { deque, labels_En, labels_symbol, createFaceLandmarker, speech2Text } from "./utils";
import { sharingan_keys, detect } from "./iris";
import { getJutsu, jutsuHelper, sendJutsu } from "./jutsu";
//import { deque, labels_En, labels_symbol, addLog, speech2Text, getJutsu } from './utils/utils';


let model_path = "/models/yolox_nano_with_post.onnx";

const optionsButton = document.getElementById("optionsButton");

const video = document.getElementById("video");
const recordButton = document.getElementById("recordButton");
const image = document.getElementById("image");

const speechtextStatus = document.getElementById("speechtextStatus");
const jutsuHelp = document.getElementById("jutsuHelp");
const handSigns = document.getElementById("handSigns");

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d', {willReadFrequently: true});

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

async function setup() {
    ort.env.wasm.wasmPaths = 'https://cdn.jsdelivr.net/npm/onnxruntime-web@1.18.0/dist/';
    Session = await ort.InferenceSession.create(model_path, {executionProviders: ['cpu']});
    if (Session) console.log("HandSign detection model loaded.");

    inputName = Session.inputNames[0];
    outputName = Session.outputNames[0];

    faceLandmarker = await createFaceLandmarker();
    if (faceLandmarker) console.log("Iris detection model loaded.");

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

function isLaptop() {
    return window.innerWidth >= 1024; // Adjust the width as needed
}

document.addEventListener('DOMContentLoaded', async() => {
    //Set canvas dimensions
    canvas.width = video.width;
    canvas.height = video.height;
    //console.log("Canvas Dims: ", canvas.width, canvas.height);

    const mainContent = document.querySelector('.container');
    if (mainContent) {
        if (isLaptop()) {
            mainContent.style.display = 'flex'
        }
        else alert("Shinobi Code is only accessible on a laptop or desktop device.");
    }
    
    await setup();
})

video.addEventListener('play', () => {

    const draw = async() => {

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.save();
        ctx.scale(-1, 1); // Flip horizontally
        ctx.drawImage(video, -canvas.width, 0, canvas.width, canvas.height);
        ctx.restore();
        
        //Footer Box
        ctx.fillStyle = 'black';
        ctx.fillRect(0, canvas.height-40, canvas.width, 40); // Rectangle position (x, y) and size (width, height)

        if(isRecording) {
            processFrame();


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
                recorder.stop();
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

        requestAnimationFrame(draw);
    };

   draw();
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
            speechtextStatus.textContent = "Listening... Say a Jutsu name and do handsigns";
            recorder.start();
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
        speechtextStatus.textContent = "";
        jutsuHelp.textContent = "";
        handSigns.textContent = "";
    }
});

let recorder, audioBlob, audioChunks = [];

if (isLaptop()) {
    navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" }, audio: true }) 
    .then(stream => {
        const videoStream = new MediaStream(stream.getVideoTracks());
        video.srcObject = videoStream;
        video.play();

        const audioStream = new MediaStream(stream.getAudioTracks());
        recorder = new MediaRecorder(audioStream);
        recorder.ondataavailable = (event) => {
            audioChunks.push(event.data);
        }
        recorder.onstop = async() => {
            audioBlob = new Blob(audioChunks , { type: 'audio/wav'});
            audioChunks = [];
            speechText = await speech2Text(audioBlob);
            if (speechText != null) {
                speechtextStatus.textContent = `You said : ${speechText}`;
                //addLog(`Speech Engine detected: ${speechText}`);
                //console.log("Speech Text: ", speechText);

                let handsigns_display = jutsuHelper(speechText);
                jutsuHelp.textContent = `Hand Signs for ${speechText}: `;
                handSigns.textContent = ` ${handsigns_display}`;
                jutsuHelp.appendChild(handSigns);
                handsigns_display = "";
            }
        }
    }).catch (err => {
        console.error('Error accessing user-facing camera:', err);
    });
}

async function processFrame() {

    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    let imgArray = new Uint8Array(imgData.data);    

    let processed = await preprocess(imgArray, imgData.width, imgData.height)
    let ratio = parseFloat(processed.ratio)

    let json_data = JSON.parse(processed.string)
    let input = new Float32Array(json_data.data)

    
    let feeds = {};
    feeds[inputName]  = new ort.Tensor('float32', input, [1, 3, ...[416,416]]);
    
    let results = await Session.run(feeds);
    let outputData = results[outputName].cpuData

    if (sharingan_keys.includes(jutsu)) {
        let landmarks;

        const Iresults = await faceLandmarker.detect(canvas);
        if (Iresults.faceLandmarks[0]) {
            landmarks = Iresults.faceLandmarks[0].map(({ x, y }) => ({ x, y }));
            detect(jutsu, landmarks,canvas.width,canvas.height);
        }
    }

    if (outputData.length != 0) {
        let output = await postprocess(outputData, results[outputName].dims, ratio, canvas.width,canvas.height)
        let label = renderBox(output)

        if (label) {
            if (sign_display_queue.size() == 0 || sign_display_arr[sign_display_arr.length - 1] != label) {
                audio.play();

                sign_display_queue.push(label);
                sign_history_queue.push(label);
                sign_display_arr = sign_history_queue.toArray();
                sign_start_time = Math.floor(Date.now() / 1000);  

                if (sign_display_queue.size() > 0) {
                    sign_display = sign_display_arr.join(" -> ");

                    //Speechtext is available and jutsu is not evaluated
                    if (speechText && !jutsu) {
                        jutsu = await getJutsu(sign_history_queue, speechText);
                    }
                    //Jutsu is already evaluated
                    if (jutsu && !Jutsu) {
                        //jutsu formatting
                        Jutsu = jutsu.split(" ");
                        for (let i = 0; i < Jutsu.length; i++) {
                            Jutsu[i] = Jutsu[i][0].toUpperCase() + Jutsu[i].slice(1);
                        }
                        Jutsu = Jutsu.join(" ");

                        //console.log("Jutsu: ", Jutsu);
                        jutsu_display = Jutsu;
                        //addLog(`Jutsu: ${jutsu_display}`);
                        jutsu_start_time = Math.floor(Date.now() / 1000);
                        
                        //Send jutsu to server
                        if (import.meta.env.VITE_Mode === 'App') {
                            const jutsuData = {
                                jutsu: jutsu,
                            };
                            await sendJutsu(jutsuData);
                        }
                    }
                }
            }
        }

        output = null;
    }

    feeds = null;
    results = null;
    outputData = null;

}


function renderBox(output) {
    
    let bbox = JSON.parse(output.bbox)
    let score = parseFloat(output.score)
    let classId = parseInt(output.class_id)

    // Check if score is above threshold
    if (score < 0.7) return;

    classId = classId + 1;
    
    // Get the bounding box
    let x1 = Math.floor(bbox[0]);
    let y1 = Math.floor(bbox[1]);
    let x2 = Math.floor(bbox[2]);
    let y2 = Math.floor(bbox[3]);

    let x_len = x2 - x1
    let y_len = y2 - y1
    let square_len = x_len >= y_len ? x_len : y_len;
    let square_x1 = Math.floor(((x1 + x2) / 2) - (square_len / 2))
    let square_y1 = Math.floor(((y1 + y2) / 2) - (square_len / 2))
    let square_x2 = square_x1 + square_len
    let square_y2 = square_y1 + square_len

    let font_size = Math.floor(square_len / 2)

    // Draw the rectangle
    /*ctx.strokeStyle = 'red';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.rect(x1, y1, x2 - x1, y2 - y1);
    ctx.stroke();*/

    // Calculate the width and height of the rectangle
    const width = square_x2 - square_x1;
    const height = square_y2 - square_y1;

    // Draw the first rectangle (white border with 4px thickness)
    ctx.lineWidth = 5;
    ctx.strokeStyle = 'white';
    ctx.strokeRect(square_x1, square_y1, width, height);

    // Draw the second rectangle (black border with 2px thickness inside the white border)
    ctx.lineWidth = 3;
    ctx.strokeStyle = 'rgb(0, 0, 0)';
    ctx.strokeRect(square_x1, square_y1, width, height);

    /*ctx.strokeStyle = 'rgb(0, 255, 0)'; // Green color
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.rect(x1, y1, x2 - x1, y2 - y1);
    ctx.stroke();*/

    // Add class label (optional)
    if (classId) {
        /*ctx.font = '20px Arial';
        ctx.fillStyle = 'white';
        ctx.fillText(`ID: ${classId}, ${labels_En[classId]}, ${score.toFixed(2)}`, x1, y1-10);*/

        ctx.font = `${font_size}px KouzanMouhitu`; //KouzanMouhitu
        ctx.fillStyle = 'rgb(185, 0, 0)';
        ctx.fillText(labels_symbol[classId], square_x2-font_size, square_y2-(Math.floor(font_size/4)));

    }

    return labels_En[classId];
}



  