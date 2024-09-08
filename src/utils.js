import { Deque } from 'data-structure-typed';
import * as wanakana from 'wanakana'
import * as vision from '@mediapipe/tasks-vision'
import jutsuData from './jutsu.json';

const { FaceLandmarker, FilesetResolver, DrawingUtils } = vision;

const speechtextStatus = document.getElementById("speechtextStatus");
//const logs = document.getElementById('logs');


export const labels_En = ['None',
  'Rat',
  'Ox',
  'Tiger',
  'Hare',
  'Dragon',
  'Snake',
  'Horse',
  'Ram',
  'Monkey',
  'Bird',
  'Dog',
  'Boar',
  'Clap',
  'Unknown',
  'Mizunoe']

export const labels_Jp = ['None',
  'Ne',
  'Ushi',
  'Tora',
  'U',
  'Tatsu',
  'Mi',
  'Uma',
  'Hitsuji',
  'Saru',
  'Tori',
  'Inu',
  'I',
  'Gassho',
  'Unknown',
  'Mizunoe']

export const labels_symbol = [
  '無',
  '子',
  '丑',
  '寅',
  '卯',
  '辰',
  '巳',
  '午',
  '未',
  '申',
  '酉',
  '戌',
  '亥',
  '祈',
  '謎',
  '壬'
]

// Deque with max length
export class deque {
    constructor(maxLen) {
      this.deque = new Deque();
      this.maxLen = maxLen;
    }
  
    push(value) {
      this.deque.push(value);
      this._enforceMaxLength();
    }
    unshift(value) {
      this.deque.unshift(value);
      this._enforceMaxLength();
    }
    pop() {
      return this.deque.pop();
    }
    shift() {
      return this.deque.shift();
    }
    _enforceMaxLength() {
      while (this.deque.size > this.maxLen) {
        this.deque.shift();
      }
    }
    size() {
      return this.deque.size;
    }
    toArray() {
      return this.deque.toArray();
    }
    clear() {
      this.deque.clear();
    }
  }


export async function createFaceLandmarker() {
  const filesetResolver = await FilesetResolver.forVisionTasks(
    "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
  );
  let faceLandmarker = await FaceLandmarker.createFromOptions(filesetResolver, {
    baseOptions: {
      modelAssetPath: `https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task`,
      delegate: "GPU"
    },
    //outputFaceBlendshapes: true,
    //runningMode,
    numFaces: 1
  });

  return faceLandmarker;
}

  
export function addLog(message) {
  const logEntry = document.createElement('div');
  logEntry.classList.add('log-entry');

  const timeStamp = new Date().toLocaleTimeString();

  logEntry.textContent = `[${timeStamp}] : ${message}`;
  logs.appendChild(logEntry);
}

export async function speech2Text(audioBlob) {
  let transcript, speechText;
  const jutsuList = Object.keys(jutsuData);

  speechtextStatus.textContent = "Transcribing... Please Wait";

  try {
    transcript = await speech2TextAPI(audioBlob)
    speechText = transcript.text;
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
    speechtextStatus.textContent = `Speech recognition error: Stop recording and please try again!`
    console.error(`Speech recognition error: You said, "${speechText}"`)
    speechText = null
  }

  const isJapanese = wanakana.isJapanese(speechText);
  if (isJapanese) {
    speechtextStatus.textContent = "Speech recognition error: Stop recording and please try again!"
    console.error(`Speech recognition error: SpeechText returned without translation, "${speechText}"`)
    speechText = null
  }

  return speechText;
}

async function speech2TextAPI(audio) {
  let endpoint = import.meta.env.VITE_Speech2TextAPI
  
  try {
      const formData = new FormData();
      formData.append('file', audio, 'recording.wav');

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

