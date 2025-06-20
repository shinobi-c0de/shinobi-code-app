let Port = process.env.PUBLIC_Port;
let Message = process.env.PUBLIC_Message;
let Endpoint = process.env.PUBLIC_ShinobiCodeAPI;

if (!Port) {
    throw new Error("Missing environment variable: PUBLIC_Port");
}
if (!Message) {
    throw new Error("Missing environment variable: PUBLIC_Message");
}
if (!Endpoint) {
    throw new Error("Missing environment variable: PUBLIC_ShinobiCodeAPI");
}

export const port = Port;
export const message = Message;
export const endpoint = Endpoint;


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
    '壬']