import * as wanakana from "wanakana";

let button = document.getElementById('button')
let speechTextDisplay = document.getElementById('speechText')

let speechText, isRecording = false;

let recorder, audioBlob, audioChunks = [];

navigator.mediaDevices.getUserMedia({audio: true }) 
.then(stream => {

    const audioStream = new MediaStream(stream.getAudioTracks());
    recorder = new MediaRecorder(audioStream);
    recorder.ondataavailable = (event) => {
        audioChunks.push(event.data);
    }
    recorder.onstop = async() => {
        audioBlob = new Blob(audioChunks , { type: 'audio/wav'});
        audioChunks = [];
        speechText = await speech2Text(audioBlob);

        if (speechText) {
            speechText = speechText.split(" ");
            for (let i = 0; i < speechText.length; i++) {
                speechText[i] = speechText[i][0].toUpperCase() + speechText[i].slice(1);
            }
            speechText = speechText.join(" ");

            speechTextDisplay.textContent = speechText

            //addLog(`Speech Engine detected: ${speechText}`);
            console.log("Speech Text: ", speechText);
        }
    }
    

}).catch (err => {
    console.error('Error accessing user-facing camera:', err);
});

button.addEventListener("click", async () => {
    if (!isRecording) {
        isRecording = true;
        speechText = "";

        if (!speechText) {
            recorder.start();
            console.log("Listening...")
            speechTextDisplay.textContent = "Listening..."
        }
    }
    else {
        isRecording = false;
        console.log("Transcribing...")
        speechTextDisplay.textContent = "Transcribing..."
        recorder.stop()
    }
});


async function speech2Text(audioBlob) {

    let transcript, speechText;
  
    const jutsuList = [
        "shadow clone jutsu",
        "summoning jutsu",
        "reanimation jutsu",
        "release",
        "fire style fireball jutsu",
        "chidori",
        "sage mode",
        "almighty push",
        "universal pull",
        "sharingan",
        "planetary devastation",
        "genjutsu",
        "izanagi",
        "kakashi of the sharingan",
        "izanami",
        "susanoo",
        "amaterasu",
        "kamui"
    ];
  
    try {
        transcript = await speech2TextAPI(audioBlob)
        speechText = transcript.text;
        console.log(transcript)
    } catch(err) {
        console.error('Speech recognition error: ' + err);
    }
    
    if (speechText) {
        speechText = speechText.split(" ");
        for (let i = 0; i < speechText.length; i++) {
            if (speechText[i] === "technique") speechText[i] = "jutsu";
        }
        speechText = speechText.join(" ");
        
    }

    if (!jutsuList.includes(speechText)) {
        speechText = null
        console.error("Please try again!")
    }
  
    const isJapanese = wanakana.isJapanese(speechText);
    if (isJapanese) {
        speechText = null
        console.error("Please try again!")
    }
  
    
    return speechText;
  }

async function speech2TextAPI(audio) {
    let endpoint = `https://speech2text-rjbzvc55ua-el.a.run.app//api/speech2text/`
    
    try {
        const formData = new FormData();
        formData.append('file', audio, 'recording.wav');
        //formData.append('lang',params.language)

        const response = await fetch(endpoint, {
            method: 'POST',
            body: formData
        });
        const data = await response.json();
        return data

    } catch(err) {
    console.error('ERROR:', err);
  }
}


