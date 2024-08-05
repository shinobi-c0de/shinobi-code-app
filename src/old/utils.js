import { Deque } from 'data-structure-typed';
import { AssemblyAI } from "assemblyai";
//import translate from '@sckt/translate'
import * as wanakana from 'wanakana'
import jutsuData from './jutsu.json';
import { engine } from '@tensorflow/tfjs';


//const speechtextStatus = document.getElementById("speechtextStatus");
//const logs = document.getElementById('logs');

const client = new AssemblyAI({
  apiKey: import.meta.env.VITE_ASSEMBLYAI,
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





async function translate(text) {
  let apiUrl = 'https://simplytranslate.org/api/translate/?engine=google';
  let queryParams = new URLSearchParams({
    from: 'ja',
    to: 'en',
    text: text
  }).toString();

  let fullUrl = `${apiUrl}&${queryParams}`;

  try {
    let response = await fetch(fullUrl);
    
    if (!response.ok) {
      throw new Error('Network response was not ok ' + response.statusText);
    }

    const data = await response.json();
    console.log(data)
    return data.translated_text
  } catch (error) {
    console.error('There was a problem with the fetch operation:', error);
  }
}

export function addLog(message) {
  const logEntry = document.createElement('div');
  logEntry.classList.add('log-entry');

  const timeStamp = new Date().toLocaleTimeString();

  logEntry.textContent = `[${timeStamp}] : ${message}`;
  logs.appendChild(logEntry);
}

export async function speech2Text(audioBlob) {

  let transcript, translated, speechText;
  /*const params = {
      audio: audioBlob,
      language_code: 'en',
      punctuate: false,
      format_text: false
  };*/
  const params = {
    audio: audioBlob,
    language: 'en'
  }

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
      //transcript = await client.transcripts.transcribe(params);
      transcript = await speech2TextAPI(params)
      speechText = transcript.text
  } catch(err) {
      speechtextStatus.textContent = "Error: " + err;
      console.error('Speech recognition error: ' + err);
  }

  if (speechText){
      speechText = speechText.split(" ");
      for (let i = 0; i < speechText.length; i++) {
          speechText[i] = speechText[i][0].toUpperCase() + speechText[i].slice(1);
      }
      speechText = speechText.join(" ");
  }

  if (!jutsuList.includes(speechText)) {
      params.language = 'ja';
      try{
          //transcript = await client.transcripts.transcribe(params);
          transcript = await speech2TextAPI(params)
          speechText = transcript.text;
      } catch(err) {
          speechtextStatus.textContent = "Error: " + err;
          console.error('Speech recognition error: ' + err);
      }
  }

  const isJapanese = wanakana.isJapanese(speechText);
  if (isJapanese) {
      try {
        console.log(speechText)
        speechText = await translate(speechText);
        console.log(speechText)
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
      
  }
 
  return speechText;

}

async function speech2TextAPI(params) {
  let endpoint = `http://localhost:8080/speech2text/`
  
  try {
      const formData = new FormData();
      formData.append('file', params.audio, 'recording.wav');
      formData.append('lang',params.language)

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
    console.log(res)
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
        audio = new Audio('audio/jutsu.mp3'); 
      }
    }
    audio.play();
}
