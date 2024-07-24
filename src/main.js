import * as tf from '@tensorflow/tfjs';
import * as faceDetection from '@tensorflow-models/face-detection';

const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

const model = faceDetection.SupportedModels.MediaPipeFaceDetector;
const detectorConfig = {
    runtime: 'tfjs', // or 'tfjs'
  }
let detector,rightEye,leftEye;
const eyeImage = new Image();
eyeImage.src = 'images/sharingan/sharingan_1.png';


async function setup() {
    // Load the face detection model
    detector = await faceDetection.createDetector(model, detectorConfig);
    console.log(detector);
}
// Set up the webcam feed
document.addEventListener('DOMContentLoaded', async() => {
    canvas.width = video.width;
    canvas.height = video.height;
    console.log("Canvas Dims: ", canvas.width, canvas.height);

    await setup();
});

navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } }) 
.then(stream => {
    video.srcObject = stream;
    video.play();
}).catch (err => {
    console.error('Error accessing user-facing camera:', err);
});


video.addEventListener('play', () => {
    async function draw() {
        
        if (detector) {

            const faces = await detector.estimateFaces(video, {flipHorizontal: true});
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            ctx.save();
            ctx.scale(-1, 1);
            ctx.drawImage(video, -canvas.width, 0, canvas.width, canvas.height);
            ctx.restore();

            if (faces[0]) {
                rightEye = faces[0].keypoints[0];
                leftEye = faces[0].keypoints[1];
                console.log(rightEye, leftEye);

                const eyeWidth = 25;
                const eyeHeight = 25;

                if (rightEye) {
                    ctx.drawImage(eyeImage, rightEye.x - eyeWidth, rightEye.y - eyeHeight, eyeWidth, eyeHeight);
                }
                if (leftEye) {
                    ctx.drawImage(eyeImage, leftEye.x - eyeWidth, leftEye.y - eyeHeight, eyeWidth, eyeHeight);
                }
                
            }
        }
        requestAnimationFrame(draw);
    }
    draw();
});
