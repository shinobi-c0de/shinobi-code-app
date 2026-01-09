import * as wanakana from "wanakana";
import jutsuData from "../data/jutsu.json";
import { endpoint } from "../utils/constants";

const StatusMsg = document.getElementById("StatusMsg") as HTMLElement;

export async function speech2Text(audioBlob: Blob) {
	let transcript,
		speechText: string = "";
	const jutsuList = Object.keys(jutsuData);

	//StatusMsg.textContent = "Transcribing... Please Wait";

	transcript = await speech2TextAPI(audioBlob);
	if (transcript) speechText = transcript;

	if (speechText) {
		const speechText_arr = speechText.split(" ");
		for (let i = 0; i < speechText_arr.length; i++) {
			if (speechText_arr[i] === "technique") speechText_arr[i] = "jutsu";
		}
		speechText = speechText_arr.join(" ");

		if (!jutsuList.includes(speechText)) {
			StatusMsg.textContent = `Speech recognition error: Stop recording and please try again!`;
			console.error(`Speech recognition error: You said, "${speechText}"`);
			speechText = "";
		}
	}

	const isJapanese = wanakana.isJapanese(speechText);
	if (isJapanese) {
		StatusMsg.textContent =
			"Speech recognition error: Stop recording and please try again!";
		console.error(
			`Speech recognition error: SpeechText returned without translation, "${speechText}"`,
		);
		speechText = "";
	}

	return speechText;
}

async function speech2TextAPI(audio: Blob) {
	try {
		const formData = new FormData();
		formData.append("file", audio, "recording.wav");

		const response = await fetch(`${endpoint}/api/speech2text`, {
			method: "POST",
			body: formData,
		});

		const data = await response.json();

		if (!response.ok) {
			const errorMessage =
				data.error?.replace("ValueError: ", "") || "Unknown error";
			//StatusMsg.textContent = `Speech recognition error: Stop recording and please try again!`;
			console.error("Speech recognition error: ", errorMessage); // Log error
		}

		return data.text;
	} catch (err) {
		console.error("ERROR:", err);
	}
}
