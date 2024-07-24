import { preprocess, postprocess } from './utils/utils';
import * as ort from 'onnxruntime-web';


export class YOLOX {
    constructor(
        model_path = 'assets/models/yolox_nano_with_post.onnx',
        input_shape = [416,416],
        class_score_th = 0.3,
        with_p6 = false
    )
    {
        this.model_path = model_path;
        this.inputShape = input_shape;
        this.classScoreTh = class_score_th;
        this.withP6 = with_p6;
    }

    // Create session
    async createSession() {
        let Session;

        await ort.InferenceSession.create(this.model_path)
        .then(session => {
        Session = session;
        });
        console.log("Inference session created", Session);
        
        return Session;
    }

    // Inference function
    async inference(session, inputImage) {
        const inputName = session.inputNames[0];
        const outputName = session.outputNames[0];
        //console.log("Input Name: ", inputName, "Output Name: ", outputName);
        
        const imageHeight = inputImage.shape[0];
        const imageWidth = inputImage.shape[1];
        //console.log("Image Dims: ", imageHeight, imageWidth);

        let [processedImage, ratio] = preprocess(inputImage, this.inputShape);
        //console.log("Pre-Processed Image:", processedImage.dataSync(),processedImage.shape, processedImage.dtype, ratio);

        let feeds = {};
        feeds[inputName] = new ort.Tensor('float32', processedImage.dataSync(), [1, 3, ...this.inputShape]);
        //console.log("Feeds: ", feeds[inputName].data, feeds[inputName].dims, feeds[inputName].type);

        let results = await session.run(feeds);
        //console.log("results:",results[outputName].data, results[outputName].dims, results[outputName].type);

        const processedResult = postprocess(
            results[outputName],
            ratio,
            imageWidth,
            imageHeight
        );
        if(!processedResult) return null;
        
        const [bboxes, scores, classIds] = processedResult;

        return {bboxes, scores, classIds};
    }
}
    