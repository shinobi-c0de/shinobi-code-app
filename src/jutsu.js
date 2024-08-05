import jutsuData from './jutsu.json';


// Jutsu function
export async function getJutsu(signHistory,speechText) {
    let jutsu,res = [];

    speechText = speechText.split(" ");
    for (let i = 0; i < speechText.length; i++) {
        speechText[i] = speechText[i][0].toUpperCase() + speechText[i].slice(1);
    }
    speechText = speechText.join(" ");

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
    if (jutsu) await playJutsuSound(jutsu);
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
        audio.play();
      }
    }
}