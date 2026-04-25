// ==========================================
// PASTE YOUR POSE MODEL LINK BELOW
// ==========================================
const URL = "https://teachablemachine.withgoogle.com/models/Uh_isQoEs/"; 

let model, webcam, ctx, labelContainer, maxPredictions;

async function init() {
    const modelURL = URL + "model.json";
    const metadataURL = URL + "metadata.json";

    document.querySelector('.start-btn').innerText = "Loading AI...";

    // Load the POSE model
    model = await tmPose.load(modelURL, metadataURL);
    maxPredictions = model.getTotalClasses();

    // Setup webcam
    const size = 300; 
    const flip = true; 
    webcam = new tmPose.Webcam(size, size, flip); 
    await webcam.setup(); 
    await webcam.play();
    window.requestAnimationFrame(loop);

    // Setup Canvas (Pose needs a canvas to draw the video)
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    ctx = canvas.getContext("2d");
    
    document.getElementById("webcam-container").innerHTML = "";
    document.getElementById("webcam-container").appendChild(canvas);
    
    labelContainer = document.getElementById("label-container");
    document.querySelector('.start-btn').style.display = 'none';
}

async function loop() {
    webcam.update(); 
    ctx.drawImage(webcam.canvas, 0, 0); // Draw the video frame
    await predict();
    window.requestAnimationFrame(loop);
}

async function predict() {
    // This is the line that was crashing! Pose needs both of these steps:
    const { pose, posenetOutput } = await model.estimatePose(webcam.canvas);
    const prediction = await model.predict(posenetOutput);

    let highestProbability = 0;
    let bestPrediction = "";

    for (let i = 0; i < maxPredictions; i++) {
        if (prediction[i].probability > highestProbability) {
            highestProbability = prediction[i].probability;
            bestPrediction = prediction[i].className;
        }
    }

    if (highestProbability > 0.75) {
        if (bestPrediction.toLowerCase() !== "idle" && bestPrediction.toLowerCase() !== "neutral") {
             labelContainer.innerHTML = bestPrediction + " (" + (highestProbability * 100).toFixed(0) + "%)";
        } else {
             labelContainer.innerHTML = "Waiting for sign...";
        }
    }
}