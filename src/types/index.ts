import { FaceLandmarker } from "@mediapipe/tasks-vision";

export type FaceLandmarkerInstance = Awaited<
	ReturnType<typeof FaceLandmarker.createFromOptions>
>;

export interface ProcessedData {
	bbox: string;
	score: string;
	class_id: string;
}

export interface ProcessedImage {
	image: number[];
	string: string;
	ratio: string;
}
