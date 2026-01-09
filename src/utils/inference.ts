import * as ort from "onnxruntime-web";
import { preprocess, postprocess } from "../pkg/detect_without_post_wasm";
import type { ProcessedImage, ProcessedData } from "../types";
import { Session, inputName, outputName, faceLandmarker } from ".";
import { detect } from "./iris";
import { sharingan_keys } from "./sharingan";

/**
 * Processes a frame from the canvas to detect hand signs and optionally trigger Sharingan.
 */
export async function processFrame(
    ctx: CanvasRenderingContext2D,
    canvas: HTMLCanvasElement,
    jutsu: string,
    isSharingan: boolean
) {
    if (!Session || !inputName || !outputName) return;

    // 1. Capture Image Data from Canvas
    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const imgArray = new Uint8Array(imgData.data);

    // 2. Preprocess using WASM
    const processed = (await preprocess(imgArray, imgData.width, imgData.height)) as ProcessedImage;
    const ratio = parseFloat(processed.ratio);

    // 3. Prepare ONNX Input Tensor
    const json_data = JSON.parse(processed.string);
    const input = new Float32Array(json_data.data);

    const feeds: Record<string, ort.Tensor> = {};
    feeds[inputName] = new ort.Tensor('float32', input, [1, 3, 416, 416]);

    // 4. Run Hand Sign Detection Inference
    const results = await Session.run(feeds);
    const resultsData = results[outputName].data as Float32Array;
    const resultsDims = new Uint32Array(results[outputName].dims);

    // 5. Sharingan / Face Logic
    if (jutsu && sharingan_keys.includes(jutsu)) {
        if (!faceLandmarker) return;
        const Iresults = faceLandmarker.detect(canvas);
        if (Iresults.faceLandmarks && Iresults.faceLandmarks[0]) {
            const landmarks = Iresults.faceLandmarks[0].map(({ x, y }) => ({ x, y }));
            detect(ctx, jutsu, isSharingan, landmarks, canvas.width, canvas.height);
        }
    }

    // 6. Postprocess Result
    if (resultsData.length !== 0) {
        const output = (await postprocess(
            resultsData,
            resultsDims,
            ratio,
            canvas.width,
            canvas.height
        )) as ProcessedData;

        return output;
    }

    return;
}
