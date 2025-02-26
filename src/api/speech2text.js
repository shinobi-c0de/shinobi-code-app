import * as wanakana from 'wanakana'
import jutsuData from '../utils/jutsu.json'

const StatusMsg = document.getElementById("StatusMsg");

export async function speech2Text(audioBlob) {
  let transcript, speechText;
  const jutsuList = Object.keys(jutsuData);

  StatusMsg.textContent = "Transcribing... Please Wait";

  transcript = await speech2TextAPI(audioBlob);
  if (transcript) speechText = transcript;
  
  if (speechText) {
    speechText = speechText.split(" ");
    for (let i = 0; i < speechText.length; i++) {
        if (speechText[i] === "technique") speechText[i] = "jutsu";
    }
    speechText = speechText.join(" ");
    
    if (!jutsuList.includes(speechText)) {
      StatusMsg.textContent = `Speech recognition error: Stop recording and please try again!`
      console.error(`Speech recognition error: You said, "${speechText}"`)
      speechText = null
    }
  }

  
  const isJapanese = wanakana.isJapanese(speechText);
  if (isJapanese) {
    StatusMsg.textContent = "Speech recognition error: Stop recording and please try again!"
    console.error(`Speech recognition error: SpeechText returned without translation, "${speechText}"`)
    speechText = null
  }

  return speechText;
  }

async function speech2TextAPI(audio) {
  let endpoint = import.meta.env.VITE_ShinobiCodeAPI;
  
  try {
    const formData = new FormData();
    formData.append('file', audio, 'recording.wav');

    const response = await fetch(`${endpoint}/api/speech2text`, {
        method: 'POST',
        body: formData
    });

    const data = await response.json();
    
    if (!response.ok) {
      const errorMessage = data.error?.replace("ValueError: ", "") || "Unknown error"; 
      StatusMsg.textContent = `Speech recognition error: Stop recording and please try again!`
      console.error('Speech recognition error: ', errorMessage); // Log error
    }
    
    return data.text

  } catch(err) {
      console.error('ERROR:', err);
  }
}