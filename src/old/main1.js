import * as tf from '@tensorflow/tfjs';
import { YOLOX } from './yolox';
import { deque, labels_En, labels_symbol, addLog, speech2Text, getJutsu } from './utils/utils';


const video = document.getElementById("video");
const recordButton = document.getElementById("record-button");
const image = document.getElementById("image");
let lang = document.getElementById("lang");

const speechtextStatus = document.getElementById("speechtextStatus");

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d', {willReadFrequently: true});


let detector,rightEye,leftEye;

let audio = new Audio('assets/audio/hand_sign.mp3');

let isRecording = false;
let yolox, Session;
let speechText;

let record_start_time, record_interval;
let sign_interval, sign_interval_start;
let sign_display_queue,sign_history_queue,sign_display_arr,sign_display;
let jutsu_display_time, jutsu_start_time, jutsu_display;

let timeout, jutsu;


async function setup() {
    yolox = new YOLOX();
    Session = await yolox.createSession();

    sign_display_queue = new deque(18);
    sign_history_queue = new deque(18);

    record_interval = 3;
    sign_interval = 3;
    jutsu_display_time = 3;
    sign_interval_start = 0;
    //jutsu_index = 0;
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
    overlay.width = canvas.width;
    overlay.height = canvas.height;

    await setup();
})


video.addEventListener('play', () => {

    const draw = async() => {

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.save();
        ctx.scale(-1, 1); // Flip horizontally
        ctx.drawImage(video, -canvas.width, 0, canvas.width, canvas.height);
        ctx.restore();
        
        /*Header Box
        ctx.fillStyle = 'black';
        ctx.fillRect(0, 0, canvas.width, 25); // Rectangle position (x, y) and size (width, height)
        //Header Text
        ctx.font = '20px KouzanMouhitu';
        ctx.fillStyle = 'white';
        ctx.fillText(text, 10, 20);*/

        //Footer Box
        ctx.fillStyle = 'black';
        ctx.fillRect(0, canvas.height-40, canvas.width, 40); // Rectangle position (x, y) and size (width, height)
    
        if(isRecording) {

            await processFrame();
            
            //Footer Text 

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

            if ((Math.floor(Date.now() / 1000) - sign_interval_start) > sign_interval) {
                sign_display_queue.clear();
                sign_history_queue.clear();
                sign_display_arr = [];
                sign_display = '';
            }
            if ((Math.floor(Date.now() / 1000) - jutsu_start_time) > jutsu_display_time) {
                jutsu_display = '';
            }
            if(sign_interval_start !== 0) {
                if (Math.floor(Date.now() / 1000) - sign_interval_start > timeout) {
                    sign_interval_start = 0;
                    jutsu_start_time = 0;
                    recordButton.click();
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
        image.src = 'assets/images/shinobi-red.png';
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
        image.src = 'assets/images/shinobi-dark.png';

        sign_interval_start = 0;
        jutsu_start_time = 0;
        speechtextStatus.textContent = '';
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
        speechtextStatus.textContent = `You said : ${speechText}`;
        addLog(`Speech Engine detected: ${speechText}`);
        console.log("Speech Text: ", speechText);
    }
    

}).catch (err => {
    console.error('Error accessing user-facing camera:', err);
});


async function processFrame() {

    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const inputs = prepare_input(imgData);

    const outputs = await run_model(inputs);
    console.log(outputs);
    if (outputs) {
        let label = renderBox(outputs.bboxes, outputs.scores, outputs.classIds);

        if (label) {
            if (sign_display_queue.size() == 0 || sign_display_arr[sign_display_arr.length - 1] != label) {
                await audio.play();

                sign_display_queue.push(label);
                sign_history_queue.push(label);
                sign_display_arr = sign_history_queue.toArray();
                sign_interval_start = Math.floor(Date.now() / 1000);  

                if (sign_display_queue.size() > 0) {
                    sign_display = sign_display_arr.join(" -> ");
                    addLog(`Video Processing Engine detected: ${sign_display}`);
                }


                jutsu = getJutsu(sign_history_queue, speechText);
                if (jutsu) {
                    jutsu_display = jutsu;
                    addLog(`Jutsu: ${jutsu_display}`);
                    jutsu_start_time = Math.floor(Date.now() / 1000);
                    jutsu = '';
                }
            }
        }

    }
}


//Button which starts recording and sends data to FastAPI
/*recordButton.addEventListener("click", async () => {
    if (!isRecording) {
        const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });

        recorder = new MediaRecorder(audioStream);

        //To get clipboard contents
        const clipboard = navigator.clipboard.readText().then((text) => {
            cbtext = text;
            })
            .catch((error) => {
                console.error("Error reading clipboard:", error);
            });

        let recordChunks = [];

        recorder.ondataavailable = event => {
            if (event.data.size > 0) {
                recordChunks.push(event.data);
            }
        };
            
        recorder.onstop = async () => {
            
            const blob = new Blob(recordChunks, { type: 'video/webm' });
            const file = new File([blob], "video.webm", { type: "video/webm" });
            
            //const reader = new FileReader();
            //reader.onloadend = () => {
            //const audioData = reader.result;
            //console.log(audioData);
            //};
            //reader.readAsArrayBuffer(blob);
            
            recordChunks = [];
            const jutsuRes = await getJutsu(cbtext,file);
            console.log(jutsuRes);

            if(jutsuRes.SpeechText) {speechText.innerHTML = jutsuRes.SpeechText;}
            if(jutsuRes.HandSign) {videoText.innerHTML = jutsuRes.HandSign;}
            if(jutsuRes.Jutsu) {jutsuText.innerHTML = jutsuRes.Jutsu;}
            console.log(jutsuRes.SpeechText,jutsuRes.HandSign,jutsuRes.Jutsu);
        };

        recorder.start();
        
        isRecording = true;
        image.src = 'images/shinobi-red.png';
        image.classList.add('Rec');
        canvas.classList.add('rec-border');
    } else {
        recorder.stop();
        isRecording = false;
        image.classList.remove('Rec');
        canvas.classList.remove('rec-border');
        image.src = 'images/shinobi-dark.png';
    }
});*/


function prepare_input(input) {
    let src = tf.browser.fromPixels(input);
    src = tf.reverse(src, 2);
    //console.log("src: ",src,src.dataSync(), src.shape, src.dtype);
    // *** is GRAY, RGB, or RGBA, according to src.channels() is 1, 3 or 4.
    //cv.cvtColor(src, dst, cv.COLOR_BGR2RGB);
    return src;
}
  
async function run_model(input) {
    let predictions;

    try {
        predictions = await yolox.inference(Session, input);
        console.log("Predictions: ", predictions);
    } catch (e) {
        console.log(e);
    }
    //console.log("Predictions: ", predictions);

    return predictions;
}


function renderBox(bbox, score, classId) {
    
    score = parseFloat(score);
    classId = parseInt(classId);

    // Check if score is above threshold
    if (score < 0.7) return;

    classId = classId + 1;
    //console.log("Class ID: ", classId);
    
    // Get the bounding box
    const x1 = Math.floor(bbox[0]);
    const y1 = Math.floor(bbox[1]);
    const x2 = Math.floor(bbox[2]);
    const y2 = Math.floor(bbox[3]);
    
    const fontSize = 100;

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
        ctx.font = '100px Arial';
        ctx.fillStyle = 'white';
        ctx.fillText(labels_symbol[classId], x2-(fontSize+10), y2-(fontSize/4));

    }

    return labels_En[classId];
    //document.body.appendChild(canvas);
}
