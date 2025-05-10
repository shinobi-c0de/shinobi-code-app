import * as tf from '@tensorflow/tfjs'
import SmallestEnclosingCircle from 'smallest-enclosing-circle'

//Sharingan Images
const Sharingan = '/images/sharingan/sharingan_1.png'
const Itachi1 = '/images/sharingan/sharingan_3.png'
const Itachi2 = '/images/sharingan/sharingan_2.png'
const Kakashi = '/images/sharingan/sharingan_1.png'
const Izanami = '/images/sharingan/sharingan_1.png'
const Madara = '/images/sharingan/sharingan_6.png'
const Sasuke = '/images/sharingan/sharingan_7.png'
const Obito = '/images/sharingan/sharingan_4.png'


const canvas = document.getElementById('canvas') as HTMLCanvasElement;

const eyeImage = new Image();
eyeImage.src = '/images/sharingan/sharingan_1.png';

const sharingan = {
    "sharingan": Sharingan,
    "genjutsu": Itachi1,
    "izanagi": Itachi2,
    "kakashi of the sharingan": Kakashi,
    "izanami": Izanami,
    "susanoo": Madara,
    "amaterasu": Sasuke,
    "kamui": Obito,
}
type Sharingan = keyof typeof sharingan;

export const sharingan_keys = Object.keys(sharingan)


// Eye indices List
let LEFT_EYE = [362, 382, 381, 380, 374, 373, 390,
    249, 263, 466, 388, 387, 386, 385, 384, 398]
let RIGHT_EYE = [33, 7, 163, 144, 145, 153, 154,
     155, 133, 173, 157, 158, 159, 160, 161, 246]

//Eyes top and bottom position indices
let LEFT_EYE_TOP = 385
let LEFT_EYE_BOTTOM = 374

let RIGHT_EYE_TOP = 159
let RIGHT_EYE_BOTTOM = 145

//Irises Indices list
let LEFT_IRIS = [474, 475, 476, 477]
let RIGHT_IRIS = [469, 470, 471, 472]

// Iris shown % 70%
let irisVisible = 0.70

// Sharingan image size
let sharinganSize = 120


function findDistance(p1: { x: number, y: number }, p2: { x: number, y: number }) {
    let { x: x1, y: y1 } = p1
    let { x: x2, y: y2 } = p2
    let distance = Math.hypot(x2 - x1, y2 - y1)

    return distance
}

export function addSharingan(centerAxis: number[], radius: number) {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    let wh = Math.round(radius * 2);
    let axis = centerAxis.map(x => Math.round(x - radius));
    ctx.drawImage(eyeImage, axis[0], axis[1], wh, wh)
}

export function detect(jutsu: string, landmarks: { x: number; y: number }[], img_w: number, img_h: number) {
    // Convert landmarks to tensor
    let landmarksTensor = tf.tensor2d(landmarks.map(p => [p.x * img_w, p.y * img_h]));

    // Convert tensor to array
    let meshPoints = landmarksTensor.arraySync().map(point => point.map(Math.round));

    let leftIrisPoints = LEFT_IRIS.map(index => 
        {
            const [x, y] = meshPoints[index];
            return { x, y };
        });

    let rightIrisPoints = RIGHT_IRIS.map(index => 
        {
            const [x, y] = meshPoints[index];
            return { x, y };
        });

    let { x: l_cx, y: l_cy, r: l_radius } = SmallestEnclosingCircle(leftIrisPoints)
    let { x: r_cx, y: r_cy, r: r_radius } = SmallestEnclosingCircle(rightIrisPoints)

    let center_left = tf.tensor1d([l_cx, l_cy], 'int32').arraySync()
    let center_right = tf.tensor1d([r_cx, r_cy], 'int32').arraySync()
    
    let leftTop = meshPoints[LEFT_EYE_TOP]
    let leftBottom = meshPoints[LEFT_EYE_BOTTOM]

    let rightTop = meshPoints[RIGHT_EYE_TOP]
    let rightBottom = meshPoints[RIGHT_EYE_BOTTOM]

    let leftDis = findDistance({ x: leftTop[0], y: leftTop[1] }, { x: leftBottom[0], y: leftBottom[1] })
    let rightDis = findDistance({ x: rightTop[0], y: rightTop[1] }, { x: rightBottom[0], y: rightBottom[1] })

    let minEyeDis = (l_radius * 1.5) * irisVisible

    mapSharingan(jutsu);

    if (leftDis > minEyeDis) addSharingan(center_left, (leftDis/1.75));
    if (rightDis > minEyeDis) addSharingan(center_right, (rightDis/1.75));
    
    landmarksTensor.dispose()
}

function mapSharingan(jutsu: string) {
    if (sharingan_keys.includes(jutsu)) {
        eyeImage.src = sharingan[jutsu as Sharingan];
    }
}

