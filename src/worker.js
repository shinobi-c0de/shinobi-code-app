import * as ort from "onnxruntime-web"
import init, {preprocess, postprocess} from "./pkg"

let latestFrame = null;
let processing = false;

let Session, inputName, outputName;
let result;


// Handle messages from main thread
self.onmessage = async function (e) {
    try {
        if (e.data.type === "init") {
            init().then(() => {console.log("WASM Initialized.")});
            await initializeModel(e.data.modelPath);
            self.postMessage({ type: "ready", Session });
        } 
        else if (e.data.type === "processFrame") {
            latestFrame = e.data;
            
            if (!processing) result = await processFrame();
            self.postMessage({ type: "result", result });
        }
    } catch (error) {
        self.postMessage({ type: "error", message: error.message });
    }
};

// Initialize ONNX model inside the worker
async function initializeModel(modelPath) {
    try {
        ort.env.wasm.wasmPaths = "https://cdn.jsdelivr.net/npm/onnxruntime-web@1.18.0/dist/";
        Session = await ort.InferenceSession.create(modelPath, {
            executionProviders: ["cpu"],
        });

        if (Session) {
            inputName = Session.inputNames[0];
            outputName = Session.outputNames[0];
        }
    } catch (error) {
        console.error("Failed to load ONNX model:", error);
    }
}

async function processFrame() {
    while (latestFrame) {
        processing = true; // Mark as processing

        let { imgArray, imgDim, canvasDim } = latestFrame;

        let processed = await preprocess(imgArray, imgDim[0], imgDim[1])
        let ratio = parseFloat(processed.ratio)
        
        let json_data = JSON.parse(processed.string)
        let input = new Float32Array(json_data.data)

        let feeds = {};
        feeds[inputName]  = new ort.Tensor('float32', input, [1, 3, ...[416,416]]);

        let results = await Session.run(feeds);
        let outputData = results[outputName].cpuData;
        console.log(outputData.length);

        if (outputData.length != 0) {
            let output = await postprocess(outputData, results[outputName].dims, ratio, canvasDim[0], canvasDim[1])
            console.log( output)
            let { bbox, width, height, classId } = processOutput(output);
            
            return { bbox, width, height, classId };
        }
    }

    processing = false;
    return { bbox: null, width: 0, height: 0, classId: null };

}

function processOutput(output) {
    
    let bbox = JSON.parse(output.bbox)
    let score = parseFloat(output.score)
    let classId = parseInt(output.class_id)

    // Check if score is above threshold
    if (score < 0.7) return;

    classId = classId + 1;
    
    // Get the bounding box
    let x1 = Math.floor(bbox[0]);
    let y1 = Math.floor(bbox[1]);
    let x2 = Math.floor(bbox[2]);
    let y2 = Math.floor(bbox[3]);

    let x_len = x2 - x1
    let y_len = y2 - y1
    let square_len = x_len >= y_len ? x_len : y_len;
    let square_x1 = Math.floor(((x1 + x2) / 2) - (square_len / 2))
    let square_y1 = Math.floor(((y1 + y2) / 2) - (square_len / 2))
    let square_x2 = square_x1 + square_len
    let square_y2 = square_y1 + square_len

    let font_size = Math.floor(square_len / 2)

    // Draw the rectangle
    /*ctx.strokeStyle = 'red';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.rect(x1, y1, x2 - x1, y2 - y1);
    ctx.stroke();*/

    // Calculate the width and height of the rectangle
    const width = square_x2 - square_x1;
    const height = square_y2 - square_y1;
    
    let f_bbox = {
        x1: square_x1,
        y1: square_y1,
        x2: square_x2,
        y2: square_y2
    };
    return {f_bbox, width, height, classId, font_size};
    let label = renderOutput(ctx, square_x1, square_y1, width, height, font_size, classId);
    return label;
}