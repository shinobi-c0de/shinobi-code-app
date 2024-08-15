import jutsuData from './jutsu.json';


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
        if(jutsuData[data].handsign === handSigns) res.push(data);
    }
    
    for (let i = 0; i < res.length; i++) {
        if( speechText === res[i]) jutsu = res[i];
    }
    if (jutsu) await playJutsuSound(jutsu);
    //jutsu = keys.find(key => jutsuData[key] === handSigns);
    return jutsu;
}

async function playJutsuSound(jutsu) {
    let audio = new Audio();
    audio.volume = 0.5;

    switch (jutsuData[jutsu].type) {

        case "jutsu": {
            audio.src = "audio/jutsu.mp3"; 
            audio.play();
            break;
        }
        case "sharingan": {
            audio.src = "audio/sharingan.mp3"; 
            audio.play();
            break;
        }
        default: console.error("Jutsu is either undefined or not a valid type");
    }
    
}