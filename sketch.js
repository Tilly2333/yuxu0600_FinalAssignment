let strokeOption;
let baseSize;
let scale;
let canvasSize = 800;

let lineData = []; // Store all line information
let lineCounter = 0; // Control the number of lines currently generated
const numGroups = 40;

// Controls
let Slider; // Can drag the slider to view different progress
let playPauseButton;
let isPlaying = true;
// Show current progress
let ProgressText = "";
let intervalId;

// Same as group coding
// Adjust stroke weights and scale based on current window size
function adjustStrokeAndScale() {
  baseSize = (width + height) / 2;
  scale = baseSize / canvasSize;
  strokeOption = [0.4, 0.8, 1, 2, 3.5];
  for (let i = 0; i < strokeOption.length; i++) {
    strokeOption[i] *= scale;
  }
}

// Draw one group of parallel lines with 30-degree tilt at a random position
function generateLineGroup() {
  const x1 = random(-width / 2, width / 2);
  const y1 = random(-height / 2, height / 2);

  const signX = random() > 0.5 ? 1 : -1;
  const signY = random() > 0.5 ? 1 : -1;
  const isTilted = random() < 0.5;

  const lineLength = random(80, 200) * scale;

  let hShift, vShift;
  if (isTilted) {
    const angle = tan(30);
    hShift = lineLength * signX;
    vShift = lineLength * angle * signY;
  } else {
    if (random() < 0.5) {
      hShift = lineLength * signX;
      vShift = 0;
    } else {
      hShift = 0;
      vShift = lineLength * signY;
    }
  }

  const x2 = x1 + hShift;
  const y2 = y1 + vShift;
  const numLines = floor(random(20, 30));
  const spacing = random(3, 8) * scale;
  const absH = abs(hShift);
  const absV = abs(vShift);

  for (let i = 0; i < numLines; i++) {
    const offset = i * spacing;
    const weight = random(strokeOption);

    let X1 = x1;
    let Y1 = y1;
    let X2 = x2;
    let Y2 = y2;

    if (absH > absV) {
      Y1 += offset;
      Y2 += offset;
    } else {
      X1 += offset;
      X2 += offset;
    }
    // Add new line object to the lineData array
    lineData.push({ x1: X1, y1: Y1, x2: X2, y2: Y2, weight: weight });
  }
}

// Generate all parallel line groups stored
function generateAllLines() {
  lineData = [];
  for (let g = 0; g < numGroups; g++) {
    generateLineGroup();
  }
}

// Update buttons and slider positions 
function updateControlsPosition() {
  // Put the controls in the center at the lower part of the window
  Slider.position(windowWidth / 2 - 200, height - 80);
  playPauseButton.position(windowWidth / 2 - 40, height - 50);
  Slider.attribute('max', lineData.length);
}

// Use timer to record the progress of lines drawing
function recordProgress() {
  // Runs once every 50 milliseconds
  intervalId = setInterval(() => {

    const totalLines = lineData.length;
    const percentage = floor((lineCounter / totalLines) * 100);
    // Update the text
    ProgressText = ` Progress: ${lineCounter} / ${totalLines} (${percentage}%)`;
  }, 50); 
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  angleMode(DEGREES);
  adjustStrokeAndScale();
  generateAllLines();
  frameRate(60);
  lineCounter = 0;

  // Create progress slider
  Slider = createSlider(0, lineData.length, 0, 1);
  Slider.size(400);
  Slider.input(() => {
    lineCounter = Slider.value();
    redraw();
  });

  // Create button
  playPauseButton = createButton('Pause');
  playPauseButton.size(80, 30);
  playPauseButton.mousePressed(() => {
    // Pause and play the animation
    if (isPlaying) {
      noLoop();
      playPauseButton.html('Play');
      isPlaying = false;
    } else {
      loop();
      playPauseButton.html('Pause');
      isPlaying = true;
    }
  });
  // Each time the window is resized or refreshed, the control positions are updated
  updateControlsPosition();
  recordProgress();
}

// Animation
function draw() {
  background(247, 241, 219);
  const totalLines = lineData.length;
  // Gray value, change from 200 to 0
  const startGray = 200;
  const range = startGray;
  push();
  translate(width / 2, height / 2);

  // Each generated line gradually becomes darker.
  for (let i = 0; i < lineCounter; i++) {
    const lineObj = lineData[i];
    let grayValue = startGray - (i  / totalLines) * range;
    grayValue = max(0, grayValue);
    stroke(grayValue);
    strokeWeight(lineObj.weight);
    line(lineObj.x1, lineObj.y1, lineObj.x2, lineObj.y2);
  }
  pop();
  // Draw the progress display updated via a time interval
  text(ProgressText, windowWidth / 2 + 80, height - 50);

  // Slider stays synchronized with the animation on the canvas
  if (lineCounter < totalLines && isPlaying) {
    lineCounter++;
    Slider.value(lineCounter);
  }
}

// Window resize
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  adjustStrokeAndScale();
  generateAllLines();
  lineCounter = 0;
  Slider.value(0);
  updateControlsPosition();
  loop();
  clearInterval(intervalId);
  recordProgress();
}
