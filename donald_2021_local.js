Array.prototype.rotateRight = function (n) {
  this.unshift.apply(this, this.splice(n, this.length));
  return this;
};

var blackColors = new Array(
  "black", "black", "black", "black", "black", "black",
  "black", "black", "black", "black", "black", "black"
);
var highlightQuadrant = true;
var testCounter;
var tutorialStep = 0; // Step counter for the tutorial
var showTutorial = true; // Default: Show the tutorial
var showFrames = true;
var showPhaseText = false;
function setup() {
  createCanvas(windowWidth, windowHeight);
  frameRate(60);
  background(10);
  stroke(0);
  testCounter = 0;
  print("Hello Donad_2021");
  topLeftImage = loadImage("topLeft.png");
  topRightImage = loadImage("topRight.png");
  bottomLeftImage = loadImage("bottomLeft.png");
  bottomRightImage = loadImage("bottomRight.png");
  // Start with the tutorial if enabled, otherwise go to idle state
  if (showTutorial) {
    activityState = 8; // Tutorial state
    tutorialStep = 0;  // Reset the tutorial step counter
  } else {
    activityState = 0; // Skip tutorial and go to idle state
  }
}


function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function deviceShaken() {
  fullscreen(true);
  background(10);
}

function distance(x1, y1, x2, y2) {
  return sqrt((x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2));
}

function touchEnded() {
  if (activityState === 8) {
    // If in tutorial state, progress the tutorial
    tutorialStep++;
    return;
  }

  // Existing touchEnded logic
  ellipse(mouseX, mouseY, 50, 50);

  if (distance(mouseX, mouseY, windowWidth / 2, windowHeight / 2) < 150) {
    fullscreen(!fullscreen());
    return;
  }
  // prevent default
  b = 0;
  if (mouseX > windowWidth / 2) {
    b += 2;
  }
  if (mouseY > windowHeight / 2) {
    b += 1;
  }
  lastButton = Array(0, 1, 3, 2)[b];
}

function ledring(x, y, colors) {
  push();
  translate(x, y);
  stroke(127, 127, 127);
  fill(10, 10, 10);
  circle(0, 0, 300);
  // show identifier
  fill("rgb(10,255,0)");
  textAlign(CENTER, CENTER);
  textSize(32);
  if (!showPhaseText) {
    text(testID, 0, 0);
  }
  textSize(16);
  text("level " + testLevel, 0, -40);
  if (showFrames) {
    text(frameCount, 0, 40);
  }
  rotate(radians(15));
  for (i = 0; i < 12; i++) {
    fill(colors[i]);
    rotate(radians(-30));
    rectMode(CENTER);
    rect(0, -100, 40, 40);
    fill("grey");
    textSize(12);
    textAlign(CENTER, CENTER);
    text(i, 0, -130, 20, 20);
  }
  pop();
}

function showLeds(leds) {
  ledring(windowWidth / 2, windowHeight / 2, leds);
}

function buttons(x, y, w, h) {
  push();
  w2 = w / 2;
  h2 = h / 2;
  translate(x, y);
  stroke(127, 127, 127);
  fill(10, 10, 10, 127);
  rect(0, 0, w2, h2);
  rect(w2, 0, w2, h2);
  rect(0, h2, w2, h2);
  rect(w2, h2, w2, h2);
  pop();
}

function showButtons() {
  if (typeof custom_buttons === "function") {
    custom_buttons(0, 0, windowWidth, windowHeight);
  } else {
    buttons(0, 0, windowWidth, windowHeight);
  }
}

function postResults(req, rec, status, time) {
  data =
    testID +
    "\t" +
    testCounter +
    "\t" +
    id +
    "\t" +
    T0_IDLE +
    "\t" +
    T1_WARN +
    "\t" +
    T2_SHOWTEST +
    "\t" +
    T3_DECAY +
    "\t" +
    T4_COUNTDOWN +
    "\t" +
    req +
    "\t" +
    rec +
    "\t" +
    status +
    "\t" +
    time +
    "\t" +
    currentLevel +
    "\t" +
    ("" + windowWidth + "x" + windowHeight);
  print(data);
}

//
// below is the statemachine implementing the test program and UI
//

var activityState = 0;
var testLevel = 0;
var lastButton = -1;
var currentLevel = -1;
var startFrame;
var test;
var game, reply;
function changeState(newState) {
  startFrame = frameCount;
  currentLevel = testLevel;
  lastButton = -1;
  activityState = newState;
  print("new activityState : " + activityState);
}

// State 0: Idle
function handleIdle() {
  showIdle(); // Call the idle animation from the animation file
  if (lastButton != -1) {
    testLevel = 2;
    changeState(1); // Transition to the prepare state
  }
}

// State 1: Prepare
function handlePrepare() {
  showPrepare(); // Call the preparation animation from the animation file
  if (frameCount - startFrame > T1_WARN) {
    game = new Game(testLevel); // Initialize the game
    reply = []; // Reset the reply array
    testCounter += 1; // Increment the test counter
    print("game : " + game.toString());
    changeState(2); // Transition to the next state
  }
}

// State 2: Show Test
function handleShowTest() {
  if (currentLevel == -1) {
    // If the sequence is finished, move to the next state
    changeState(3); // Transition to the decay state
    return;
  }

  // Play the sequence step by step
  if (frameCount % T2_SHOWTEST == 0) {
    if (currentLevel > 0) {
      // Get the current button index in the sequence
      let expectedIndex = game.getValue(testLevel - currentLevel);

      // Log the expected button index to the console
      console.log("Expected button index (sequence playback):", expectedIndex);

      // Light up the field corresponding to the current step in the sequence
      showTestStep(expectedIndex); // Call showTestStep from animations.js
    }
    currentLevel = currentLevel - 1; // Move to the next step in the sequence
  } else if (frameCount % T2_SHOWTEST > T2_SHOWTEST - 10) {
    // Turn off all fields briefly between steps
    clearHighlights(); // Clear the background highlight
    showLeds(blackColors); // Turn off all LEDs
  }
}
// State 3: Decay
function handleDecay() {
  showDecay(); // Call the decay animation from the animation file
  if (frameCount - startFrame > T3_DECAY) {
    changeState(4);
    return;
  }
}
// State 4: Check Response
function handleCheckResponse() {
  if (frameCount - startFrame > T4_COUNTDOWN) {
    postResults(game.toString(), "" + reply, "timeout", frameCount - startFrame);
    changeState(5);
    return;
  }
  showCountdown(); // Call the countdown animation from the animation file
  switch (lastButton) {
    case -1:
      break;
    default:
      reply.push(lastButton);
      if (lastButton != game.getValue(testLevel - currentLevel)) {
        postResults(game.toString(), "" + reply, "wrong", frameCount - startFrame);
        lastButton = -1;
        changeState(7);
        return;
      }
      currentLevel = currentLevel - 1;
      if (currentLevel == 0) {
        postResults(game.toString(), "" + reply, "correct", frameCount - startFrame);
        lastButton = -1;
        changeState(6);
        return;
      }
  }
  lastButton = -1;
}

// State 5: Timeout
function handleTimeOut() {
  showTimeout(); // Call the timeout animation from the animation file
  if (frameCount - startFrame > T5_TIMEOUT) {
    testLevel = 0;
    changeState(0);
  }
}

// State 6: Success
function handleSuccess() {
  showSuccess(); // Call the success animation from the animation file
  if (frameCount - startFrame > T6_CORRECT) {
    testLevel += 1;
    changeState(1);
  }
}

// State 7: Failure
function handleFailure() {
  showFailure(); // Call the failure animation from the animation file
  if (frameCount - startFrame > T7_INCORRECT) {
    testLevel = max(testLevel - 1, 0);
    if (testLevel == 0) {
      changeState(0);
    } else {
      changeState(1);
    }
  }
}

// State 8: Tutorial
function handleTutorial() {
  background(10); // Clear the screen
  showButtons(); // Show the buttons

  // Display tutorial instructions based on the current step
  fill("white");
  textAlign(CENTER, CENTER);
  textSize(24);

  switch (tutorialStep) {
    case 0:
      text(
        "Welcome to the Donald Remembering Game!",
        windowWidth / 2,
        windowHeight / 4
      );
      text("Tap anywhere to continue.", windowWidth / 2, windowHeight / 2);
      break;

    case 1:
      text(
        "The goal is to remember and repeat the sequence of lights.",
        windowWidth / 2,
        windowHeight / 4
      );
      text("Tap anywhere to continue.", windowWidth / 2, windowHeight / 2);
      break;

    case 2:
      text(
        "Watch the lights carefully as they light up in a sequence.",
        windowWidth / 2,
        windowHeight / 4
      );
      text("Tap anywhere to continue.", windowWidth / 2, windowHeight / 2);
      break;

    case 3:
      text(
        "When it's your turn, tap the buttons in the same order.",
        windowWidth / 2,
        windowHeight / 4
      );
      text("Tap anywhere to continue.", windowWidth / 2, windowHeight / 2);
      break;

    case 4:
      text(
        "If you get it right, the sequence gets longer!",
        windowWidth / 2,
        windowHeight / 4
      );
      text("Tap anywhere to continue.", windowWidth / 2, windowHeight / 2);
      break;

    case 5:
      text(
        "If you make a mistake, the game will end.",
        windowWidth / 2,
        windowHeight / 4
      );
      text("Tap anywhere to continue.", windowWidth / 2, windowHeight / 2);
      break;

    case 6:
      text("Good luck and have fun!", windowWidth / 2, windowHeight / 4);
      text("Tap anywhere to start the game.", windowWidth / 2, windowHeight / 2);
      break;

    default:
      // End the tutorial and start the game
      changeState(0); // Go to the idle state
      return;
  }
}

// State machine in draw function
function draw() {
  // Draw the game based on the current activity state
  switch (activityState) {
    case 0:
      handleIdle();
      break;
    case 1:
      handlePrepare();
      break;
    case 2:
      handleShowTest();
      break;
    case 3:
      handleDecay();
      break;
    case 4:
      handleCheckResponse();
      break;
    case 5:
      handleTimeOut();
      break;
    case 6:
      handleSuccess();
      break;
    case 7:
      handleFailure();
      break;
    case 8:
      handleTutorial();
      break;
    default:
      break;
  }

  // Display the phase text
  displayPhaseText();
}



function displayPhaseText() {
  if (!showPhaseText) return; // If the flag is false, don't display the text

  push();
  fill('white');
  textSize(24);
  textAlign(CENTER, CENTER);

  // Determine the text to display based on the current activityState
  let phaseText = "";
  switch (activityState) {
    case 0:
      phaseText = "Waiting for Input"; // Idle state
      break;
    case 1:
      phaseText = "Prepare Yourself"; // Prepare state
      break;
    case 2:
      phaseText = "Playing Sequence"; // Show test sequence
      break;
    case 3:
      phaseText = "Memory Decay"; // Decay state
      break;
    case 4:
      phaseText = "Your Turn!"; // Check response
      break;
    case 5:
      phaseText = "Time's Up!"; // Timeout state
      break;
    case 6:
      phaseText = "Success!"; // Success state
      break;
    case 7:
      phaseText = "Failure!"; // Failure state
      break;
    case 8:
      phaseText = "Tutorial"; // Tutorial state
      break;
    default:
      phaseText = "Unknown Phase"; // Fallback for unexpected states
      break;
  }

  // Display the text in the center of the screen
  text(phaseText, windowWidth / 2, windowHeight / 2);
  pop();
}
