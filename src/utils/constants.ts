const Port = import.meta.env.VITE_PORT;
const Message = import.meta.env.VITE_MESSAGE;
const Endpoint = import.meta.env.VITE_SHINOBI_CODE_API;

if (!Port) {
	throw new Error("Missing environment variable: VITE_PORT");
}
if (!Message) {
	throw new Error("Missing environment variable: VITE_MESSAGE");
}
if (!Endpoint) {
	throw new Error("Missing environment variable: VITE_SHINOBI_CODE_API");
}

export const port = Port;
export const message = Message;
export const endpoint = Endpoint;

export const labels_En = [
	"None",
	"Rat",
	"Ox",
	"Tiger",
	"Hare",
	"Dragon",
	"Snake",
	"Horse",
	"Ram",
	"Monkey",
	"Bird",
	"Dog",
	"Boar",
	"Clap",
	"Unknown",
	"Mizunoe",
];

export const labels_Jp = [
	"None",
	"Ne",
	"Ushi",
	"Tora",
	"U",
	"Tatsu",
	"Mi",
	"Uma",
	"Hitsuji",
	"Saru",
	"Tori",
	"Inu",
	"I",
	"Gassho",
	"Unknown",
	"Mizunoe",
];

export const labels_symbol = [
	"無",
	"子",
	"丑",
	"寅",
	"卯",
	"辰",
	"巳",
	"午",
	"未",
	"申",
	"酉",
	"戌",
	"亥",
	"祈",
	"謎",
	"壬",
];
