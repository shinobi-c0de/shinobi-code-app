import * as tf from '@tensorflow/tfjs';
import { Deque } from 'data-structure-typed';
import { AssemblyAI } from "assemblyai";
import translate from '@sckt/translate'
import * as wanakana from 'wanakana'
import * as jutsuData from './jutsu.json';


const speechtextStatus = document.getElementById("speechtextStatus");
const logs = document.getElementById('logs');

const client = new AssemblyAI({
  apiKey: process.env.AssemblyAI,
});


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
  'Gassho',
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



// Preprocess function before providing image to model
export function preprocess(image, inputSize) {
  let paddedImage;
  /*
  if (image.shape[2] === 3) {
      paddedImage = tf.variable(tf.ones([inputSize[0], inputSize[1], 3], 'int32').mul(114).cast('int32'));
      console.log(image.shape[2]);
  } else {
      paddedImage = tf.variable(tf.ones(inputSize, 'int32').mul(114).cast('int32'));
  }*/

  const ratio = Math.min(inputSize[0] / image.shape[0], inputSize[1] / image.shape[1]);
  const newSize = { width: (Math.floor(image.shape[1] * ratio)), height: (Math.floor(image.shape[0] * ratio))};
  let resizedImage = tf.image.resizeBilinear(image, [newSize.height, newSize.width]).cast('int32');        
 
  paddedImage = tf.pad(resizedImage, [[0, inputSize[0] - resizedImage.shape[0]], [0, inputSize[1] - resizedImage.shape[1]], [0, 0]], 114);

  paddedImage = paddedImage.transpose([2, 0, 1]);
  paddedImage = tf.tensor(paddedImage.dataSync(), paddedImage.shape, 'float32');

  const preprocessedImage = paddedImage.clone();
  tf.dispose([paddedImage, resizedImage]);

  return [preprocessedImage, ratio];
}

// Postprocess function after model inference
export function postprocess(dets, ratio, maxWidth, maxHeight) {
  
  if (!dets || dets.dims[0] < 1) {
      return null; // Handle empty or invalid detections
  }
  dets = tf.tensor(dets.data, dets.dims, 'float32');

  const classIds = dets.slice([0, 1], [-1, 1]); // Equivalent to dets[..., 1:2]
  const scores = dets.slice([0, 2], [-1, 1]); // Equivalent to dets[..., 2:3]
  const bboxes = dets.slice([0, 3], [-1, -1]); // Equivalent to dets[..., 3:]

  const keepIdx = tf.argMax(scores); // Use tf.argMax for efficient argmax
  let classId = tf.gather(classIds, keepIdx);
  let score = tf.gather(scores, keepIdx);
  
  let bbox = tf.gather(bboxes, keepIdx).squeeze([0]); // Select first bbox element
  bbox = tf.div(bbox, ratio); // Divide bbox by ratio

  // Convert to JavaScript array for easier manipulation
  // Apply bounding constraints
  bbox = bbox.arraySync(); 
  score = score.arraySync();
  classId = classId.arraySync();

  bbox[0] = Math.max(0, bbox[0]);
  bbox[1] = Math.max(0, bbox[1]);
  bbox[2] = Math.min(bbox[2], maxWidth);
  bbox[3] = Math.min(bbox[3], maxHeight);
  
  tf.dispose([dets, keepIdx, classIds, scores, bboxes]);
  return [bbox, score, classId];
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
  const params = {
      audio: audioBlob,
      language_code: 'en',
      punctuate: false,
      format_text: false
    };

  const jutsuList = [
      "Shadow Clone Jutsu",
      "Summoning Jutsu",
      "Reanimation Jutsu",
      "Release",
      "Fire Style Fireball Jutsu",
      "Chidori",
      "Sage Mode",
      "Almighty Push",
      "Universal Pull",
      "Sharingan",
      "Planetary Devastation",
      "Genjutsu",
      "Izanagi",
      "Kakashi of the Sharingan",
      "Izanami",
      "Susanoo",
      "Amaterasu",
      "Kamui"
  ];

  try {
      transcript = await client.transcripts.transcribe(params);
  } catch(err) {
      speechtextStatus.textContent = "Error: " + err;
      console.error('Speech recognition error: ' + err);
  }
  speechText = transcript.text;

  if (speechText){
      speechText = speechText.split(" ");
      for (let i = 0; i < speechText.length; i++) {
          speechText[i] = speechText[i][0].toUpperCase() + speechText[i].slice(1);
      }
      speechText = speechText.join(" ");
  }

  if (!jutsuList.includes(speechText)) {
      console.log(speechText);
      params.language_code = 'ja';
      try{
          transcript = await client.transcripts.transcribe(params);
      } catch(err) {
          speechtextStatus.textContent = "Error: " + err;
          console.error('Speech recognition error: ' + err);
      }
      speechText = transcript.text;
  }

  const isJapanese = wanakana.isJapanese(speechText);
  if (isJapanese) {
      try {
          speechText = await translate(speechText, {from: "ja", engine: "lingva"});
      } catch(err) {
          console.error(err);
          speechText = "";
          addLog(`Error translating speech text: ${err}`);
          speechtextStatus.textContent = "Error translating speech text.";
      }
  }

  if (speechText) {
      speechText = speechText.split(" ");
      for (let i = 0; i < speechText.length; i++) {
          if (speechText[i] === "Technique") speechText[i] = "Jutsu";
      }
      speechText = speechText.join(" ");
      
      return speechText;
  }
  /*if (lang.checked) {
      recognition.lang = "ja-JP";
  } else {
      recognition.lang = "en-IN";
  }*/
}

// Jutsu function
export function getJutsu(signHistory,speechText) {
    let jutsu,res = [];
  
    signHistory = signHistory.toArray();
    let handSigns = signHistory.join(' ');

    let keys = Object.keys(jutsuData);
    for (let key in keys) {
        let data = keys[key];
        if(jutsuData[data] === handSigns) res.push(data);
    }
    for (let i = 0; i < res.length; i++) {
        if( speechText === res[i]) jutsu = res[i];
    }
    if (jutsu) playJutsuSound(jutsu);
    //jutsu = keys.find(key => jutsuData[key] === handSigns);
    return jutsu;
}

async function playJutsuSound(jutsu) {
    let audio;

    jutsu = jutsu.split(" ");
    
    for (let i = 0; i < jutsu.length; i++) {
      if (jutsu[i] === "Jutsu") {
        jutsu = jutsu[i];
        audio = new Audio('assets/audio/jutsu.mp3'); 
      }
    }
    audio.play();
}
