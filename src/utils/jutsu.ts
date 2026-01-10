import Jutsu from "../data/jutsu.json";
import handSignSfx from "../assets/audio/hand_sign.mp3";
import JutsuSfx from "../assets/audio/jutsu.mp3";
import SharinganSfx from "../assets/audio/sharingan.mp3";
import ChidoriSfx from "../assets/audio/chidori.mp3";
import GenjutsuSfx from "../assets/audio/sonosharingan.mp3";


interface JutsuEntry {
	type: string;
	handsign: string[];
}

const jutsuData: Record<string, JutsuEntry> = Jutsu;

// Audio Instance Management
const handSignAudio = new Audio(handSignSfx);
const jutsuAudio = new Audio();
handSignAudio.volume = 0.5;
jutsuAudio.volume = 0.5;

export function playHandSignSound() {
	handSignAudio.currentTime = 0;
	handSignAudio.play().catch(() => { /*comments to suppress linting*/ });
}

async function playJutsuSound(jutsu: string) {
	const data = jutsuData[jutsu];
	if (!data) return;

	// Determine the correct source
	const isSpecial = ["chidori", "genjutsu"].includes(jutsu);

	if (isSpecial) {
		jutsuAudio.src = jutsu === "chidori" ? ChidoriSfx : GenjutsuSfx;
	} else {
		switch (data.type) {
			case "sharingan":
				jutsuAudio.src = SharinganSfx;
				break;
			case "rinnegan":
			default:
				jutsuAudio.src = JutsuSfx;
				break;
		}
	}

	jutsuAudio.currentTime = 0;
	await jutsuAudio.play().catch(() => { /**/ });
}

// Jutsu logic updated to accept combination directly
export async function getJutsu(
	combination: string[],
	speechText: string,
) {
	const currentCombination = combination.join(" ");
	let matchedJutsu = "";

	// Find all jutsus that match the current hand sign sequence
	const possibleJutsus = Object.keys(jutsuData).filter(key =>
		jutsuData[key].handsign.includes(currentCombination)
	);

	// If a voice command (speechText) matches one of the possible jutsus, activate it
	for (const jutsu of possibleJutsus) {
		if (jutsu === speechText.toLowerCase().trim()) {
			matchedJutsu = jutsu;
			break;
		}
	}

	if (matchedJutsu) {
		await playJutsuSound(matchedJutsu);
	}

	return matchedJutsu;
}

export function jutsuHelper(speechtext: string) {
	let handsigns = "",
		handsigns_arr = [];
	if (speechtext === "chidori") handsigns = jutsuData[speechtext].handsign[1];
	else handsigns = jutsuData[speechtext].handsign[0];

	handsigns_arr = handsigns.split(" ");
	const handsigns_display = handsigns_arr.join(" -> ");

	return handsigns_display;
}
