import * as ort from "onnxruntime-web"
import * as vision from '@mediapipe/tasks-vision'

import init from "../pkg/detect_without_post_wasm"
import type { FaceLandmarkerInstance } from '../types'

const { FaceLandmarker, FilesetResolver } = vision;

const model_path = "/models/yolox_nano_with_post.onnx";

export let Session: ort.InferenceSession;
export let inputName: string, outputName: string;
export let faceLandmarker: FaceLandmarkerInstance;

let wasmIsLoading = false
let modelIsLoading = false;

export async function createFaceLandmarker(): Promise<FaceLandmarkerInstance> {
    try {
        const filesetResolver = await FilesetResolver.forVisionTasks(
            "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision/wasm"
        );
        faceLandmarker = await FaceLandmarker.createFromOptions(filesetResolver, {
            baseOptions: {
                modelAssetPath: `https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task`,
                delegate: "GPU"
            },
            //outputFaceBlendshapes: true,
            //runningMode,
            numFaces: 1
        });

        return faceLandmarker;
    } catch (error) {
        throw new Error("Error initializing FaceLandmarker:" + error);
    }
}

export function init_wasm() {
    if (wasmIsLoading) return;
    wasmIsLoading = true;
    init().then(() => { console.log("WASM initialised") });
}

export async function init_models() {
    if (Session || modelIsLoading) return;
    modelIsLoading = true;

    ort.env.wasm.wasmPaths = 'https://cdn.jsdelivr.net/npm/onnxruntime-web/dist/';

    try {
        Session = await ort.InferenceSession.create(model_path, { executionProviders: ['wasm'] });
        if (!Session) throw new Error("Failed to create ONNX Runtime session");

        inputName = Session.inputNames[0];
        outputName = Session.outputNames[0];
        console.log("Input Name:", inputName, "Output Name:", outputName);

        faceLandmarker = await createFaceLandmarker();
        if (!faceLandmarker) throw new Error("Failed to create faceLandmarker.");

        if (Session && faceLandmarker) {
            console.log("Models loaded successfully");
        }

        const canvas = document.createElement("canvas");
        faceLandmarker.detect(canvas); // Dummy call to load the model
    } catch (e) {
        console.error("Model initialization failed:", e);
        throw e;
    } finally {
        modelIsLoading = false;
    }
}
