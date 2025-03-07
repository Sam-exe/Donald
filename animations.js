//
//
// timings in frames not milliseconds!Running at 60 FPS
//
var id             = 'TEST';

var T0_IDLE        = 20; // one idle step
var T1_WARN        = 120;
var T2_SHOWTEST    = 40; // one test step
var T3_DECAY       = 120;
var T4_COUNTDOWN   = 360;
var T5_TIMEOUT     = 120;
var T6_CORRECT     = 120;
var T7_INCORRECT   = 120;

//
//  custom_buttons - to customize the look of the buttons
//  uncomment and modify this code
//
// function custom_buttons(x, y, w, h) {
//   push();
//   w2 = w / 2;
//   h2 = h / 2;
//   translate(x, y);
//
//    bcolor = color(127, 127, 127, 127);
//   if (testLevel > 3) {
//     bcolor = color(0, 0, 0, 127);
//   }
//
//
//   stroke(127, 127, 127);
//   fill(bcolor);
//   rect(0, 0, w2, h2);
//   rect(w2, 0, w2, h2);
//   rect(0, h2, w2, h2);
//   rect(w2, h2, w2, h2);
//
//   fill('grey');
//   textSize(36);
//   textAlign(CENTER, CENTER);
//   w3 = w2/2;
//   h3 = h2/2;
//   text("0", w3, h3);
//   text("1", w3, h3 + h2);
//   text("2", w3 + w2, h3 + h2);
//   text("3", w3 + w2, h3);
//   pop();
// }

//
// uncomment and change tis code when you want something else than reset to level 0 or timeout
//
//function custom_timeout()
//{
//  testLevel = Math.max(testLevel - 2,0);
// return 1; // new state
//}



//
//  F0 shows the attention grabbing animation meant to seduce you to interact
//
//
var idleColors = new Array(
  180, // snigle digit grey scale
  'white', // named color
  '#fae', // three digit hex
  '#222222', // six digit hex
  'rgb(10,255,0)', // integer rgb value
  'rgba(0,255,0,0.25)', // integer rgba value
  'rgb(100%, 0%, 10%)', // percentge rgb notation
  'rgba(100%, 0%, 100%, 0.2)', // percentge rgba notation
  'grey',
  'blue',
  'pink',
  'green',
  'teal'
  );

function showIdle() {
  if (frameCount % T0_IDLE == 0) {
    showButtons();
    showLeds(idleColors);
    idleColors.rotateRight(-1);
  }
}

//
//  F1 warns to prepare yourself to remeber the coming sequence
//
//
var prepColors = new Array(
  'pink', // named color
  'black', // named color
  'black', // named color
  'black', // named color
  'black', // named color
  'black', // named color
  'black', // named color
  'black', // named color
  'black', // named color
  'black', // named color
  'black', // named color
  'black' // named color
  );

function showPrepare() {
  if (frameCount % (T1_WARN / 12) == 0) {
    showButtons();
    showLeds(prepColors);
    prepColors.rotateRight(1);
  }
}

//
//  F2 display a single block of pixels
//
//
var   blokColors = new Array(
  'red', // named color
  'red', // named color
  'red', // named color
  'black', // named color
  'black', // named color
  'black', // named color
  'black', // named color
  'black', // named color
  'black', // named color
  'black', // named color
  'black', // named color
  'black' // named color
  );

function showTestStep(index) {
  // Display the buttons
  showButtons();

  // Highlight the button corresponding to the current index if highlighting is enabled
  if (highlightQuadrant) {
    push();
    noStroke();
    fill('rgba(255, 255, 0, 0.5)'); // Semi-transparent yellow highlight

    // Calculate button position and size
    let w = windowWidth / 2; // Half the width
    let h = windowHeight / 2; // Half the height

    // Highlight based on the index
    switch (index) {
      case 0: // Top-Left Quadrant
        image(topLeftImage, 0, 0, w, h);
        break;
      case 1: // Bottom-Left Quadrant
        image(topRightImage, 0, h, w, h);
        break;
      case 2: // Bottom-Right Quadrant
        image(bottomLeftImage, w, h, w, h);
        break;
      case 3: // Top-Right Quadrant
        image(bottomRightImage, w, 0, w, h);
        break;
      default:
        console.error("Invalid button index:", index);
        break;
    }

    pop();
  }

  // Rotate and light up the LEDs
  blokColors.rotateRight(-3 * index); // Rotate to the proper position
  showLeds(blokColors); // Light up the LEDs
  blokColors.rotateRight(3 * index); // Rotate back for the next block
}

  

function clearHighlights() {
  // Redraw the buttons without any highlights
  showButtons();
}



//
//  F3 decay is where your short senory and term memory slowly fades away
//
//
var decayColors = new Array(
  'blue', // named color
  'blue', // named color
  'blue', // named color
  'blue', // named color
  'blue', // named color
  'blue', // named color
  'black', // named color
  'black', // named color
  'black', // named color
  'black', // named color
  'black', // named color
  'black' // named color
  );

function showDecay() {
  if (frameCount % (T3_DECAY / 12) == 0) {
    showLeds(decayColors);
    decayColors.rotateRight(3);
  }
}

//
//  F4 display a countdown animation to stresss you more
//
//
var countColors = new Array(
  'teal', // named color
  'black', // named color
  'black', // named color
  'black', // named color
  'black', // named color
  'black', // named color
  'black', // named color
  'black', // named color
  'black', // named color
  'black', // named color
  'black', // named color
  'black' // named color
  );

function showCountdown() {
  if (frameCount % (T4_COUNTDOWN / 12) == 0) {
    showButtons();
    showLeds(countColors);
    countColors.rotateRight(-1);
  }
}


//
//  F5 alas, you took too long to respond completely
//
//
var timeoutColors = new Array(
  'orange', // named color
  'yellow', // named color
  'orange', // named color
  'yellow', // named color
  'orange', // named color
  'yellow', // named color
  'orange', // named color
  'yellow', // named color
  'orange', // named color
  'yellow', // named color
  'orange', // named color
  'yellow' // named color
  );

function showTimeout() {
  if (frameCount % (T5_TIMEOUT / 12) == 0) {
    showButtons();
    showLeds(timeoutColors);
    timeoutColors.rotateRight(-1);
  }
}

//
//  F6 you entered the correct sequence, bravo!
//
//
var successColors = new Array(
  'green', // named color
  'green', // named color
  'green', // named color
  'green', // named color
  'green', // named color
  'green', // named color
  'green', // named color
  'green', // named color
  'green', // named color
  'green', // named color
  'green', // named color
  'green' // named color
  );

function showSuccess() {
  // no animation yet in this code
  if (frameCount % (T6_CORRECT / 12) == 0) {
    showButtons();
    showLeds(successColors);
  }
}
//
//  F7 alas, you failed to enter the correct sequence
//
//
var failColors = new Array(
  'red', // named color
  'red', // named color
  'red', // named color
  'red', // named color
  'red', // named color
  'red', // named color
  'red', // named color
  'red', // named color
  'red', // named color
  'red', // named color
  'red', // named color
  'red' // named color
  );

function showFailure() {
  // no animation yet in this code
  if (frameCount % (T7_INCORRECT / 12) == 0) {
    showButtons();
    showLeds(failColors);
  }
}
