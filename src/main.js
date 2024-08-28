import * as ort from "onnxruntime-web"
import init, {preprocess,postprocess} from "./pkg"
import { deque, labels_En, labels_symbol, speech2Text, createFaceLandmarker } from "./utils";
import { sharingan_keys, detect } from "./iris";
import { getJutsu } from "./jutsu";


//import { deque, labels_En, labels_symbol, addLog, speech2Text, getJutsu } from './utils/utils';
let model_path = "/models/yolox_nano_with_post.onnx";

const video = document.getElementById("video");
const recordButton = document.getElementById("record-button");
const image = document.getElementById("image");

const speechtextStatus = document.getElementById("speechtextStatus");

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d', {willReadFrequently: true});

let isRecording;
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
    Session = await ort.InferenceSession.create(model_path);
    if (Session) console.log("HandSign detection model loaded.");

    inputName = Session.inputNames[0];
    outputName = Session.outputNames[0];

    faceLandmarker = await createFaceLandmarker();
    if (faceLandmarker) console.log("Iris detection model loaded.");

    init().then(() => {console.log("WASM Initialized.")});

    sign_display_queue = new deque(18);
    sign_history_queue = new deque(18);

    record_interval = 3;
    sign_interval = 3;
    jutsu_display_time = 3;
    sign_start_time = 0;
    jutsu_start_time = 0;
    timeout = 15;
    sign_display = '';
    jutsu_display = '';

}

document.addEventListener('DOMContentLoaded', async() => {
    //Set canvas dimensions
    canvas.width = video.width;
    canvas.height = video.height;
    console.log("Canvas Dims: ", canvas.width, canvas.height);

    const mainContent = document.querySelector('.container');
    if (mainContent) {
        if (window.innerWidth < 1024) alert("Shinobi Code is only accessible on a laptop or desktop device.");
        if (window.innerWidth >= 1024) {
            // If screen width is less than 1024px (likely a mobile device), hide the webpage
            if (mainContent) {
                mainContent.style.display = 'flex'
            }
        }
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
                    //For testing comment below line
                    //recordButton.click();
                }
            }
        }

        requestAnimationFrame(draw);
    };

   draw();
});


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
    }
});

let recorder, audioBlob, audioChunks = [];

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
        if (speechText != null) speechtextStatus.textContent = `You said : ${speechText}`;
        //addLog(`Speech Engine detected: ${speechText}`);
        console.log("Speech Text: ", speechText);
    }
    

}).catch (err => {
    console.error('Error accessing user-facing camera:', err);
});


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
        let output = await postprocess(outputData, results[outputName].dims, ratio, 960,540)
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

                        console.log("Jutsu: ", Jutsu);
                        jutsu_display = Jutsu;
                        //addLog(`Jutsu: ${jutsu_display}`);
                        jutsu_start_time = Math.floor(Date.now() / 1000);
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
    let fontSize = 100;

    // Draw the rectangle
    ctx.strokeStyle = 'red';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.rect(x1, y1, x2 - x1, y2 - y1);
    ctx.stroke();

    /*ctx.strokeStyle = 'rgb(0, 255, 0)'; // Green color
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.rect(x1, y1, x2 - x1, y2 - y1);
    ctx.stroke();*/

    // Add class label (optional)
    if (classId) {
        ctx.font = '20px Arial';
        ctx.fillStyle = 'white';
        ctx.fillText(`ID: ${classId}, ${labels_En[classId]}, ${score.toFixed(2)}`, x1, y1-10);

        ctx.font = '100px KouzanMouhitu'; //KouzanMouhitu
        ctx.fillStyle = 'white';
        ctx.fillText(labels_symbol[classId], x2-(fontSize+10), y2-(fontSize/4));

    }

    return labels_En[classId];
}



  