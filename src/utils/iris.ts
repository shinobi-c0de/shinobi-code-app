import SmallestEnclosingCircle from "smallest-enclosing-circle";
import { mapSharingan } from "./sharingan";
import { drawSharingan } from "./draw";


// Eye indices List
/*const LEFT_EYE = [
	362, 382, 381, 380, 374, 373, 390, 249, 263, 466, 388, 387, 386, 385, 384,
	398,
];
const RIGHT_EYE = [
	33, 7, 163, 144, 145, 153, 154, 155, 133, 173, 157, 158, 159, 160, 161, 246,
];*/

//Eyes top and bottom position indices
const LEFT_EYE_TOP = 385;
const LEFT_EYE_BOTTOM = 374;

const RIGHT_EYE_TOP = 159;
const RIGHT_EYE_BOTTOM = 145;

//Irises Indices list
const LEFT_IRIS = [474, 475, 476, 477];
const RIGHT_IRIS = [469, 470, 471, 472];

// Iris shown % 70%
const irisVisible = 0.7;

// Sharingan image size
//const sharinganSize = 120;

function findDistance(
	p1: { x: number; y: number },
	p2: { x: number; y: number },
) {
	const { x: x1, y: y1 } = p1;
	const { x: x2, y: y2 } = p2;
	const distance = Math.hypot(x2 - x1, y2 - y1);

	return distance;
}

export function detect(
	ctx: CanvasRenderingContext2D,
	jutsu: string,
	isSharingan: boolean,
	landmarks: { x: number; y: number }[],
	img_w: number,
	img_h: number,
) {
	// Convert landmarks to pixel coordinates
	const meshPoints = landmarks.map(p => [
		Math.round(p.x * img_w),
		Math.round(p.y * img_h),
	]);

	const leftIrisPoints = LEFT_IRIS.map((index) => {
		const [x, y] = meshPoints[index];
		return { x, y };
	});

	const rightIrisPoints = RIGHT_IRIS.map((index) => {
		const [x, y] = meshPoints[index];
		return { x, y };
	});

	const {
		x: l_cx,
		y: l_cy,
		r: l_radius,
	} = SmallestEnclosingCircle(leftIrisPoints);
	const {
		x: r_cx,
		y: r_cy,
		//r: r_radius,
	} = SmallestEnclosingCircle(rightIrisPoints);

	const center_left = [Math.round(l_cx), Math.round(l_cy)];
	const center_right = [Math.round(r_cx), Math.round(r_cy)];

	const leftTop = meshPoints[LEFT_EYE_TOP];
	const leftBottom = meshPoints[LEFT_EYE_BOTTOM];

	const rightTop = meshPoints[RIGHT_EYE_TOP];
	const rightBottom = meshPoints[RIGHT_EYE_BOTTOM];

	const leftDis = findDistance(
		{ x: leftTop[0], y: leftTop[1] },
		{ x: leftBottom[0], y: leftBottom[1] },
	);
	const rightDis = findDistance(
		{ x: rightTop[0], y: rightTop[1] },
		{ x: rightBottom[0], y: rightBottom[1] },
	);

	const minEyeDis = l_radius * 1.5 * irisVisible;

	const sharingan_img = mapSharingan(jutsu);

	if (leftDis > minEyeDis) drawSharingan(ctx, isSharingan, sharingan_img, center_left, leftDis / 1.75);
	if (rightDis > minEyeDis) drawSharingan(ctx, isSharingan, sharingan_img, center_right, rightDis / 1.75);
}


