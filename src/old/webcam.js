import { YOLOX } from '../yolox';
import * as tf from '@tensorflow/tfjs';


// Reference the elements that we will need
const Status = document.getElementById('status');
const container = document.getElementById('container');

const video = document.getElementById('video');

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d', { willReadFrequently: true });

const overlay = document.getElementById('overlay');
const overlayCanvas = document.createElement('canvas');
const overlayCtx = overlayCanvas.getContext('2d');

let yolox, Session;
let isProcessing = false;
let previousTime;

async function setup() {
    yolox = new YOLOX();
    Session = await yolox.createSession();
}

video.addEventListener('loadedmetadata', () => {
    canvas.width = video.width;
    canvas.height = video.height;
    console.log("Canvas Dims: ", canvas.width, canvas.height);

    setup();
})

video.addEventListener('play', () => {
    // Start the animation loop
    window.requestAnimationFrame(updateCanvas);
})


// Start the video stream
navigator.mediaDevices.getUserMedia(
    { video: true }, // Ask for video
).then((stream) => {
    // Set up the video and canvas elements.
    video.srcObject = stream;
    video.play();
    
}).catch((error) => {
    alert(error);
});

function updateCanvas() {
    const { width, height } = canvas;
    ctx.drawImage(video, 0, 0, width, height);

    if (!isProcessing && Session) {
        isProcessing = true;
        (async function () {
            
            // Process the image and run the model
            const inputs = prepare_input();
            console.log("Cap Frame: ", inputs, inputs.dataSync(), inputs.shape, inputs.dtype);

            const outputs = await run_model(inputs);
            
            // Update UI
            overlay.innerHTML = '';

            if(!outputs) console.log("No detections"); 
            else renderBox(outputs.bboxes, outputs.scores, outputs.classIds);
        
            //const sizes = inputs.shape;
            //outputs.tolist().forEach(x => renderBox(x, sizes));
            //renderBoxes(outputs.bboxes, outputs.scores, outputs.classIds, sizes);
            if (previousTime !== undefined) {
                const fps = 1000 / (performance.now() - previousTime);
                Status.textContent = `FPS: ${fps.toFixed(2)}`;
            }
            previousTime = performance.now();
            isProcessing = false;
        })();
    }

    window.requestAnimationFrame(updateCanvas);
}



function prepare_input() {
    let imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    let src = tf.browser.fromPixels(imgData);
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
    } catch (e) {
        console.log(e);
    }
    console.log("Predictions: ", predictions);

    return predictions;
}
  
function renderBox(bbox, score, classId = null) {

    const labels = ['None',
        'Ne(Rat)',
        'Ushi(Ox)',
        'Tora(Tiger)',
        'U(Hare)',
        'Tatsu(Dragon)',
        'Mi(Snake)',
        'Uma(Horse)',
        'Hitsuji(Ram)',
        'Saru(Monkey)',
        'Tori(Bird)',
        'Inu(Dog)',
        'I(Boar)',
        'Gassho',
        'Unknown',
        'Mizunoe']

    score = parseFloat(score);
    classId = parseInt(classId);
    // Check if score is above threshold
    if (score < 0.7) return;

    classId = classId + 1;

    // Get the bounding box
    const x1 = Math.floor(bbox[0]);
    const y1 = Math.floor(bbox[1]);
    const x2 = Math.floor(bbox[2]);
    const y2 = Math.floor(bbox[3]);

    // Draw the rectangle
    ctx.strokeStyle = 'red';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.rect(x1, y1, x2 - x1, y2 - y1);
    ctx.stroke();

    /*
    ctx.strokeStyle = 'rgb(0, 255, 0)'; // Green color
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.rect(x1, y1, x2 - x1, y2 - y1);
    ctx.stroke();*/

    // Add class label (optional)
    if (classId) {
        ctx.font = '20px Arial';
        ctx.fillStyle = 'white';
        ctx.fillText(`ID: ${classId}, ${labels[classId]}, ${score.toFixed(2)}`, x1, y1 - 10);
    }
    document.body.appendChild(canvas);
}

// Render a bounding box and label on the image
function renderBoxes(bbox, score, class_id, [w, h]) {
    if (score < threshold) return; // Skip boxes with low confidence

    const xmin = bbox[0];
    const ymin = bbox[1];
    const xmax = bbox[2];
    const ymax = bbox[3];

    // Generate a random color for the box
    const color = 'red';

    // Draw the box
    const boxElement = document.createElement('div');
    boxElement.className = 'bounding-box';
    Object.assign(boxElement.style, {
        borderColor: color,
        left: 100 * xmin / w + '%',
        top: 100 * ymin / h + '%',
        width: 100 * (xmax - xmin) / w + '%',
        height: 100 * (ymax - ymin) / h + '%',
    })

    // Draw label
    const labelElement = document.createElement('span');
    labelElement.textContent = `${class_id} ${labels[class_id]} (${(100 * score).toFixed(2)}%)`;
    labelElement.className = 'bounding-box-label';
    labelElement.style.backgroundColor = color;

    boxElement.appendChild(labelElement);
    overlay.appendChild(boxElement);
}