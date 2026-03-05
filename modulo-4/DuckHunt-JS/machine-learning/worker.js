importScripts('https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@latest');

const MODEL_PATH = `yolov5n_web_model/model.json`;
const LABELS_PATH = `yolov5n_web_model/labels.json`;
const INPUT_MODEL_DIMENTIONS = 640 // this is the size of the image that the model expects, we will resize the input image to this size before running inference
const CLASS_THRESHOLD = 0.4

let _labels = []
let _model = null
async function loadModelAndLabels() {

     // certify that tensorflow.js is ready before loading the model and labels
    await tf.ready()

    _labels = await (await fetch(LABELS_PATH)).json()
    _model = await tf.loadGraphModel(MODEL_PATH)

    // warmup - send a fixed data through the model to initialize it and cache any necessary resources
    const dummyInput = tf.ones(_model.inputs[0].shape)
    await _model.executeAsync(dummyInput)
    tf.dispose(dummyInput)

    postMessage({ type: 'model-loaded' })

}

/**
 * Pre process the image to the format accepted by YOLO:
 * - tf.browser.fromPixels(): converts ImageBitmap/ImageData to tensor [H, W, 3] where H is height, W is width and 3 is the number of color channels (RGB)
 * - tf.image.resizeBilinear(): resizes to [INPUT_DIM, INPUT_DIM]
 * - .div(255): normalizes values to [0, 1]: some models expect pixel values to be in the range of 0 to 1, so we divide by 255 to normalize the values
 * - .expandDims(0): adds batch dimension [1, H, W, 3] to match model input shape
 *
 * Uso of tf.tidy():
 * - Garantees that the intermediate tensors created during preprocessing are automatically disposed of, preventing memory leaks.
 */
function preprocessImage(input) {

    return tf.tidy(() => {
        const image = tf.browser.fromPixels(input)

        return tf.image
            .resizeBilinear(image, [INPUT_MODEL_DIMENTIONS, INPUT_MODEL_DIMENTIONS])
            .div(255)
            .expandDims(0)
    })
}

async function runInference(tensor) {
    const output = await _model.executeAsync(tensor)
    tf.dispose(tensor)
    //Assumes that the model outputs are in the order of [boxes, scores, classes, ...otherOutputs]

    const [boxes, scores, classes] = output.slice(0, 3)
    const [boxesData, scoresData, classesData] = await Promise.all(
        [
            boxes.data(),
            scores.data(),
            classes.data(),
        ]
    )

    output.forEach(t => t.dispose())

    return {
        boxes: boxesData,
        scores: scoresData,
        classes: classesData
    }
}

/**
 * Filters and processes the predictions:
 * - Applies confidence threshold (CLASS_THRESHOLD)
 * - Filters only the desired class (example: 'kite')
 * - Converts normalized coordinates to actual pixel coordinates
 * - Calculates the center of the bounding box
 *
 * Usage of generator (function*):
 * - Allows sending each prediction as soon as it's processed, without creating an intermediate list    
 */

function* processPrediction({ boxes, scores, classes }, width, height) {
    // boxes, scores and classes are flat arrays of the same size where each detection corresponds to a slice of these arrays
    for (let index = 0; index < scores.length; index++) {
        if (scores[index] < CLASS_THRESHOLD) continue

        const label = _labels[classes[index]]

        //the model identify the ducks as kites, so we need to filter only the predictions with the label 'kite'
        if (label !== 'kite') continue

        // transform the normalized coordinates (0 to 1) to pixel coordinates based on the original image size
        // we need the 4 dimensions so it starts with index * 4 and ends with (index + 1) * 4 to get the correct slice of the boxes array for the current detection
        let [x1, y1, x2, y2] = boxes.slice(index * 4, (index + 1) * 4)
        x1 *= width
        x2 *= width
        y1 *= height
        y2 *= height

        // get to the "center" of the bounding box, which is where we will click to shoot the duck
        const boxWidth = x2 - x1
        const boxHeight = y2 - y1
        const centerX = x1 + boxWidth / 2
        const centerY = y1 + boxHeight / 2

        yield {
            x: centerX,
            y: centerY,
            score: (scores[index] * 100).toFixed(2)
        }

    }
}

loadModelAndLabels()

self.onmessage = async ({ data }) => {
    if (data.type !== 'predict') return
    if (!_model) return

    // data.image is a ImageBitmap sent from the main thread, we need to preprocess it and run inference
    const input = preprocessImage(data.image)
    const { width, height } = data.image

    const inferenceResults = await runInference(input)

    for (const prediction of processPrediction(inferenceResults, width, height)) {
        postMessage({
            type: 'prediction',
            ...prediction
        });
    }
};

console.log('🧠 YOLOv5n Web Worker initialized');
