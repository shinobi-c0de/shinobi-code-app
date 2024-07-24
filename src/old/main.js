const video = document.getElementById("video");
const recordButton = document.getElementById("record-button");
const image = document.getElementById("image");

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');


const speechText = document.getElementById("speechtext");
const videoText = document.getElementById("videotext");
const jutsuText = document.getElementById("jutsutext");

let isRecording = false;
let recorder,cbtext;
let text  = "FPS: ";

navigator.mediaDevices.getUserMedia({ video:{facingMode: "user"} }) 
.then(stream => {
    video.srcObject = stream;
    video.autoplay = true;
}).catch (err => {
    console.error('Error accessing user-facing camera:', err);
});

//Set canvas dimensions
video.addEventListener('loadedmetadata', () => {
    console.log(video.width, video.height);
    canvas.width = video.width;
    canvas.height = video.height;
});

video.addEventListener('play', () => {
    const draw = () => {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        /*//Header Box
        ctx.fillStyle = 'black';
        ctx.fillRect(0, 0, canvas.width, 25); // Rectangle position (x, y) and size (width, height)
        //Header Text
        ctx.font = '20px KouzanMouhitu';
        ctx.fillStyle = 'white';
        ctx.fillText(text, 10, 20);*/
        //Footer Box
        ctx.fillStyle = 'black';
        ctx.fillRect(0, canvas.height-40, canvas.width, 40); // Rectangle position (x, y) and size (width, height)
        
        requestAnimationFrame(draw);
    };
    requestAnimationFrame(draw);

});

//Button which starts recording and sends data to FastAPI
recordButton.addEventListener("click", async () => {
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
            /*
            const reader = new FileReader();
            reader.onloadend = () => {
            const audioData = reader.result;
            console.log(audioData);
            };
            reader.readAsArrayBuffer(blob);
            */
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
});


//Button which sends data to VSCode
sendDataButton.addEventListener('click', async () => {
    const data = {message: "Hello from Client!"};
    await sendData(data,'/data');
});


//To send data to FastAPI
async function getJutsu(text,videodata) {
    
    const formData = new FormData(); 
    formData.append('videofile', videodata);
    formData.append('querytext', text);
    for (const pair of formData.entries()) {
        console.log(pair[0] + ': ' + pair[1]);
    }

    const apiUrl = "http://127.0.0.1:8000/jutsu";

    const response =  await fetch(apiUrl, {
    method: 'POST',
    body: formData
    });

    const message =  await response.json();
    return message;
}
