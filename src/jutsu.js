import jutsuData from './jutsu.json';

let audio_base = new Audio();
let audio_extra = new Audio();
audio_base.volume = 0.5;
//let Jutsu;
// Jutsu function
export async function getJutsu(signHistory,speechText) {
    let jutsu,res = [];

    /*speechText = speechText.split(" ");
    for (let i = 0; i < speechText.length; i++) {
        speechText[i] = speechText[i][0].toUpperCase() + speechText[i].slice(1);
    }
    speechText = speechText.join(" ");*/

    signHistory = signHistory.toArray();
    let handSigns = signHistory.join(' ');

    let keys = Object.keys(jutsuData);

    for (let key in keys) {
        let data = keys[key];
        if(jutsuData[data].handsign.includes(handSigns)) res.push(data);
    }

    for (let i = 0; i < res.length; i++) {
        if( speechText === res[i]) jutsu = res[i];
    }
    if (jutsu) playJutsuSound(jutsu);
    //jutsu = keys.find(key => jutsuData[key] === handSigns);
    return jutsu;
}

//Event handler to play audio unique to jutsu once base audio is finished
/*audio_base.addEventListener('ended', () => {
    switch (Jutsu) {
        case "chidori": {
            audio_extra.src = "audio/chidori.mp3";
            audio_extra.play();
            break;
        }
        case "genjutsu": {
            audio_extra.src = "audio/sonosharingan.mp3";
            audio_extra.play();
            break;
        }
    }
});*/

async function playJutsuSound(jutsu) {
    //Jutsu = jutsu;

    switch (jutsuData[jutsu].type) {
        case "jutsu": {
            audio_base.src = "audio/jutsu.mp3"; 
            await audio_base.play();
            break;
        }
        case "sharingan": {
            audio_base.src = "audio/sharingan.mp3"; 
            await audio_base.play();
            break;
        }
        case "rinnegan": {
            audio_base.src = "audio/jutsu.mp3"; 
            await audio_base.play();
            break;
        }
    }
    switch (jutsu) {
        case "chidori": {
            audio_extra.src = "audio/chidori.mp3";
            audio_extra.play();
            break;
        }
        case "genjutsu": {
            audio_extra.src = "audio/sonosharingan.mp3";
            audio_extra.play();
            break;
        }
    }
}

export function jutsuHelper(speechtext) {
    let handsigns;
    if (speechtext == "chidori") handsigns = jutsuData[speechtext].handsign[1];
    else handsigns= jutsuData[speechtext].handsign[0];
  
    handsigns = handsigns.split(' ')
    let handsigns_display = handsigns.join(" -> ")
  
    return handsigns_display
  }

//To send data to VS Code
export async function sendJutsu(data) {
    const Data = JSON.stringify(data);

    try {
        const response = await fetch('http://localhost:8080/sendJutsu', {
            method: 'POST', // Can be GET, PUT, DELETE etc.
            body: Data,
            headers: { 'Content-Type': 'application/json' }, // Specify content type
        });
        if (!response.ok) {
            throw new Error(`Error sending data: ${response.statusText}`);
        }
    } catch (error) {
        console.error('Error:', error);
    }
}