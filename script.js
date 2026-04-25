// ==========================================
// PASTE YOUR TEACHABLE MACHINE LINK BELOW
// Example: const URL = "https://teachablemachine.withgoogle.com/models/abc123xyz/";
// ==========================================
const URL = "https://teachablemachine.withgoogle.com/models/Uh_isQoEs/"; 

let model, webcam, labelContainer, maxPredictions;

// Load the image model and setup the webcam
async function init() {
    if(URL === "YOUR_LINK_GOES_HERE") {
        alert("Please add your Teachable Machine URL in script.js!");
        return;
    }

    const modelURL = URL + "model.json";
    const metadataURL = URL + "metadata.json";

    // Change button text to show loading state
    document.querySelector('.start-btn').innerText = "Loading AI Model...";

    // Load the model and metadata
    model = await tmImage.load(modelURL, metadataURL);
    maxPredictions = model.getTotalClasses();

    // Setup webcam for image classification
    const flip = true; // whether to flip the webcam
    webcam = new tmImage.Webcam(400, 400, flip); // width, height, flip
    await webcam.setup(); // request access to the webcam
    await webcam.play();
    window.requestAnimationFrame(loop);

    // Append webcam canvas to the DOM
    document.getElementById("webcam-container").innerHTML = "";
    document.getElementById("webcam-container").appendChild(webcam.canvas);
    
    labelContainer = document.getElementById("label-container");
    document.querySelector('.start-btn').style.display = 'none'; // Hide button after start
}

async function loop() {
    webcam.update(); // update the webcam frame
    await predict();
    window.requestAnimationFrame(loop);
}

// Run the webcam image through the image model
async function predict() {
    // predict can take in an image, video or canvas html element
    const prediction = await model.predict(webcam.canvas);
    
    let highestProbability = 0;
    let bestPrediction = "";

    // Find the class with the highest probability
    for (let i = 0; i < maxPredictions; i++) {
        if (prediction[i].probability > highestProbability) {
            highestProbability = prediction[i].probability;
            bestPrediction = prediction[i].className;
        }
    }

    // Only update text if confidence is over 75% to avoid flickering
    if (highestProbability > 0.75) {
        // Hide "Background" or "Idle" classes if you named one that way
        if (bestPrediction.toLowerCase() !== "background" && bestPrediction.toLowerCase() !== "idle") {
             labelContainer.innerHTML = bestPrediction + " (" + (highestProbability * 100).toFixed(0) + "%)";
        } else {
             labelContainer.innerHTML = "Waiting for sign...";
        }
    }
}