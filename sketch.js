var bubbles = [];
var virtualHeight = 1000;
var virtualWidth = 1000;
var fps = 25;
var mpf = 1000 / fps;
var drawTimes = [mpf];
var lastFrameTime = 0;
var minRadius = 2;
var maxRadius = 16;
var topSpeed = 5;
var numberOfBubbles = 500;
const initialColor = [255, 255, 255];
const initialAlpha = 0x7F;
var averageFrameRate = fps;
var recentFrameRates = [];
var innerLoopTimes = [];
var avefr = fps;
var reportTime = 0;
var maxBounces = 0;
var minBounces = 0;
var searchSpace = 2.2 * (maxRadius + topSpeed);
var drawingFlag = 0;
var simulateFlag = 0;
let trackingGrid = [];
let gridX = ~~(virtualWidth / searchSpace);
let gridY = ~~(virtualHeight / searchSpace);
let gridSpanX = virtualWidth / gridX;
let gridSpanY = virtualHeight / gridY;
let triesRecord = [];
var laserBeams = false;
var simulationInterval, reportInterval;
var simulating = true,
  reporting = false;

function setup() {
  createCanvas(windowWidth - 5, windowHeight - 5);
  noStroke();
  noCursor();
  virtualWidth = width;
  const bubbleFactor = (~~(virtualWidth / searchSpace)) * (~~(virtualHeight / searchSpace));
  virtualHeight = height;
  numberOfBubbles = bubbleFactor / log(minRadius * 2); // random(bubbleFactor / 1.75, bubbleFactor / 1.33);
  let lts = 0;
  bubbles[0] = new Bubble(virtualWidth / 2, virtualHeight / 2, random(minRadius, maxRadius), initialColor, initialAlpha);
  updateGrid();
  for (let i = 1; i < numberOfBubbles; i++) {
    let br = i % (maxRadius - minRadius) + minRadius,
      by = random(0 + br, virtualHeight - br),
      bx = random(0 + br, virtualWidth - br),
      found = 0,
      tries = 0,
      ts;
    while (found !== 1) {
      if (tries === 500) {
        numberOfBubbles = bubbles.length;
        console.log(numberOfBubbles);
        break;
      }
      found = 1;
      let neighborhood = getNeighborhoodFromGrid(bx, by);
      ts = window.performance.now();
      for (var k = 0; k < neighborhood.length; k++) {
        if (dist(bx, by, neighborhood[k].x, neighborhood[k].y) < 1.5 * (br + neighborhood[k].radius)) {
          br = i % (maxRadius - minRadius) + minRadius;
          by = random(0 + br, virtualHeight - br);
          bx = random(0 + br, virtualWidth - br);
          found = 0;
          tries++;
          break;
        }
      }

      lts += (window.performance.now() - ts)
    }
    if (found) {
      triesRecord.push(tries);
      bubbles[i] = new Bubble(bx, by, br, initialColor, initialAlpha);
      addToGrid(bubbles[i]);
    }
  }
  /*bubbles.sort(function(a, b) {
    if (a.radius < b.radius) return -1;
    if (a.radius == b.radius) return 0;
    if (a.radius > b.radius) return 1;
  });*/
  console.log(lts);
  simulationInterval = setInterval(simulateTimeStep, mpf);
}

function draw() {
  if (simulateFlag || drawingFlag) return;
  drawingFlag = 1;
  background(0xF, 0xF, 0xF, 0x7F);
  for (let i = 0; i < bubbles.length; i++) {
    bubbles[i].display();
  }
  drawingFlag = 0;
  push();
  noFill();
  stroke([255, 0, 0], 127);
  strokeWeight(3);
  ellipse(mouseX, mouseY, 36, 36);
  line(mouseX - 22, mouseY, mouseX + 22, mouseY);
  line(mouseX, mouseY - 22, mouseX, mouseY + 22);
  pop();
  lastFrameTime = window.performance.now();
}

function windowResized() {
  resizeCanvas(windowWidth - 5, windowHeight - 5);
  virtualWidth = width;
  virtualHeight = height;

  while (drawingFlag || simulateFlag) {}
  drawingFlag = 1;
  updateGrid();
  console.log(bubbles.length);
  /*bubbles.forEach(function(bubble) {
    if (bubble.x > width - bubble.radius || bubble.y > height - bubble.radius) {
      if (!bubble.pop(0.75)) delete bubble;
      else addToGrid(bubble);
    }
  });*/

  /*  for (var i = 0; i < bubbles.length; i++) {
      if (bubbles[i].x > width - bubbles[i].radius || bubbles[i].y > height - bubbles[i].radius) {
        if (!bubbles[i].pop(0.75)) {
          bubbles.splice(i, 1);
        } el.se {
          //addToGrid(bubbles[i]);
        }
      }
    }*/
  for (let i = 0; i < bubbles.length; i++) {
    const br = minRadius;
    let found = 0,
      tries = 0,
      by = random(0 + br, virtualHeight - br),
      bx = random(0 + br, virtualWidth - br);


    while (!found && bubbles.length > i) {
      if (bubbles[i].x > width - bubbles[i].radius || bubbles[i].y > height - bubbles[i].radius) {
        if (tries == 500) {
          tries = 0;
          bubbles.splice(i, 1);
          found = 0;
          continue;
        } else {
          let neighbors = getNeighborhoodFromGrid(bx, by);
          found = 1;
          for (let k = 0; k < neighbors.length; k++) {
            if (dist(bx, by, neighbors[k].x, neighbors[k].y) < (searchSpace - maxRadius - topSpeed)) {
              by = random(0 + br, virtualHeight - br);
              bx = random(0 + br, virtualWidth - br);
              found = 0;
              tries++;
              break;
            }
          }
        }

        if (found && i < bubbles.length) {
          triesRecord.push(tries);
          bubbles[i].radius = br;
          bubbles[i].x = bx;
          bubbles[i].y = by;
          bubbles[i].burst = 0.75;
          addToGrid(bubbles[i]);
        }
      } else found = 1;
    }
  }
  //simulateFlag = 0;
  drawingFlag = 0;
  if (!simulating) {
    simulateTimeStep();
    draw();
  }
  console.log(bubbles.length);
};



function simulateTimeStep() {
  while (drawingFlag || simulateFlag) {}
  simulateFlag = 1;
  updateGrid();
  for (let i = 0; i < bubbles.length; i++) {
    bubbles[i].neighbors = [];
    neighborhood = getNeighborhoodFromGrid(bubbles[i].x, bubbles[i].y);
    for (let j = 0; j < neighborhood.length; j++) {
      bubbles[i].collision(neighborhood[j]);
    }
  }
  for (let i = 0; i < bubbles.length; i++) {
    bubbles[i].move(bubbles);
    if (bubbles[i].burst) {
      bubbles[i].history = [];
      const intensity = bubbles[i].burst;
      bubbles[i].burst = 0;
      const concentrated = concentrateColor(bubbles[i].color);
      //fill(concentrated, 255);
      //ellipse(bubbles[i].x, bubbles[i].y, 2 * (bubbles[i].farthestNeighbor + maxRadius), 2 * (bubbles[i].farthestNeighbor + maxRadius));
      flashNeighborhood(bubbles[i].x, bubbles[i].y, (concentrated)); // [255, 255, 255]);
      for (let j = 0; j < bubbles[i].neighbors.length; j++) {
        bubbles[i].neighbors[j].color = interpolateColors(concentrated, bubbles[i].neighbors[j].color, intensity);
      }
      bubbles[i].color = [0, 0, 0];
      bubbles[i].teleport();
    }
  }
  if (laserBeams) {
    var neighbors = getNeighborhoodFromGrid(mouseX, mouseY);
    var targets = [];
    var children = [];
    /*for (let i = 0; i < neighbors.length; i++) {
      if (neighbors.length % 1 === 0) {
        //neighbors[i].color = [255, 0, 255];
        if (targets.indexOf(neighbors[i]) === -1 || children.indexOf(neighbors[i].neighbors[k]) === -1) {
          targets.push(neighbors[i]);
        }
        //targets +=
        for (let k = 0; k < neighbors[i].neighbors.length; k++) {
          if (targets.indexOf(neighbors[i].neighbors[k]) === -1 || children.indexOf(neighbors[i].neighbors[k]) === -1) {
            children.push(neighbors[i].neighbors[k]);
          }
          //neighbors[i].neighbors[k].color = [255, 191, 0];
          //targets += neighbors[i].neighbors[k].slice();
        }
        //targets += neighbors[i].neighbors.slice();
        //neighbors[i].pop(1);
      }
    }*/
    neighbors.forEach(function(bubble) {
      if (targets.indexOf(bubble) === -1) {
        targets.push(bubble)
      }
    });
    targets.forEach(function(bubble) {
      bubble.neighbors.forEach(function(child) {
        if (targets.indexOf(child) === -1 && children.indexOf(child) === -1) {
          children.push(child);
        }
      })
    });
    targets.forEach(function(bubble) {
      bubble.color = [255, 0, 255];
      bubble.pop(1);
    });
    children.forEach(function(bubble) {
      bubble.color = [0, 255, 255];
      bubble.pop(0.125);
    });
    if (neighbors.length % 1 === 0)
      flashNeighborhood(mouseX, mouseY, [255, 255, 255]);
  }
  simulateFlag = 0;
}

function updateGrid() {
  gridX = ~~(virtualWidth / searchSpace);
  gridY = ~~(virtualHeight / searchSpace);
  gridSpanX = virtualWidth / gridX;
  gridSpanY = virtualHeight / gridY;

  trackingGrid = [];
  for (let i = 0; i < gridY * gridX; i++) {
    trackingGrid[i] = [];
  }

  for (let i = 0; i < bubbles.length; i++) {
    const r = bubbles[i].radius;
    if (bubbles[i].x > virtualWidth || bubbles[i].y > virtualHeight || 0 + r > bubbles[i].x || 0 + r > bubbles[i].y) continue;
    addToGrid(bubbles[i]);
  }
}

function addToGrid(bubble) {
  const tx = ~~(bubble.x / gridSpanX);
  const ty = ~~(bubble.y / gridSpanY);
  const yBottom = constrain(ty - 1, 0, gridY - 1);
  const yTop = constrain(ty + 1, 0, gridY - 1);
  const xBottom = constrain(tx - 1, 0, gridX - 1);
  const xTop = constrain(tx + 1, 0, gridX - 1);

  for (let k = yBottom; k <= yTop; k++) {
    for (let j = xBottom; j <= xTop; j++) {
      Array.isArray(trackingGrid[k * gridX + j]) ? trackingGrid[k * gridX + j].push(bubble) : trackingGrid[k * gridX + j] = [bubble];
    }
  }
}

function getNeighborhoodFromGrid(x, y) {
  const row = ~~(y / gridSpanY);
  const column = ~~(x / gridSpanX);
  return Array.isArray(trackingGrid[row * gridX + column]) ? trackingGrid[row * gridX + column] : [];
};

function getGridCoordinates(x, y) {
  return createVector(~~(x / gridSpanX), ~~(y / gridSpanY));
};

function performanceReport() {
  //ts = window.performance.now();
  //ilt = window.performance.now() - ts;

  while (recentFrameRates.length > fps * 10) {
    recentFrameRates.shift();
    //innerLoopTimes.shift();
  }
  recentFrameRates.push(frameRate());
  //innerLoopTimes.push(ilt);

  if (window.performance.now() - reportTime > 10000) {
    let iltSum = 0,
      iltVariance = 0,
      tmpSum = 0,
      tmpVariance = 0;
    for (let i = 0; i < recentFrameRates.length; i++) {
      tmpSum += recentFrameRates[i];
      iltSum += innerLoopTimes[i];
    }
    avefr = tmpSum / recentFrameRates.length;
    aveilt = iltSum / innerLoopTimes.length;
    averageFrameRate = (3 * averageFrameRate + avefr) / 4;
    for (let i = 0; i < recentFrameRates.length; i++) {
      tmpVariance += ((avefr - recentFrameRates[i]) ** 2);
      iltVariance += ((aveilt - innerLoopTimes[i]) ** 2);
    }
    console.log("++++Frame Rates++++\n10 second average:\n" + avefr +
      "\nstandard deviation:\n" + (sqrt(tmpVariance / recentFrameRates.length)) +
      "\nrunning average:\n" + averageFrameRate);
    //console.log("++++Inner Loop Times++++\n10 second average:\n" + aveilt +
    //"\nstandard deviation:\n" + (sqrt(iltVariance / innerLoopTimes.length))); // + "\nrunning average:\n" + averageFrameRate);
    reportTime = window.performance.now();
  }
};

function mousePressed() {
  console.log("Pop bubbles at the mouse pointer.");
  var neighbors = getNeighborhoodFromGrid(mouseX, mouseY);
  for (var i = 0; i < neighbors.length; i++) {
    neighbors[i].pop();
  }
  flashNeighborhood(mouseX, mouseY, [255, 255, 255]);
}


function flashNeighborhood(x, y, color) {
  const tx = ~~(x / gridSpanX);
  const ty = ~~(y / gridSpanY);
  const yBottom = constrain(ty - 1, 0, gridY - 1);
  const yTop = constrain(ty + 1, 0, gridY - 1);
  const xBottom = constrain(tx - 1, 0, gridX - 1);
  const xTop = constrain(tx + 1, 0, gridX - 1);
  fill(color, 255);
  for (let k = yBottom; k <= yTop; k++) {
    for (let j = xBottom; j <= xTop; j++) {
      rect(j * gridSpanX, k * gridSpanY, gridSpanX, gridSpanY);

    }
  }
}

function keyTyped() {
  console.log("Key pressed: " + key);
  switch (key) {
    case 'b':
    case 'B':
      console.log("Pop bubbles at the mouse pointer.");
      var neighbors = getNeighborhoodFromGrid(mouseX, mouseY);
      for (var i = 0; i < neighbors.length; i++) {
        neighbors[i].pop();
      }
      flashNeighborhood(mouseX, mouseY, [255, 255, 255]);
      break;
    case 'l':
    case 'L':
      laserBeams = !laserBeams;
      console.log("FRIKKEN LASER BEAMS ENGAGED!: " + laserBeams);
      break;
    case 'r':
    case 'R':
      if (!reporting) {
        reportInterval = setInterval(performanceReport, mpf);
      } else {
        clearInterval(reportInterval);
      }
      reporting = !reporting;
      console.log("Performance report enabled: " + reporting);
      break;
    case 'p':
    case 'P':
      if (simulating) {
        clearInterval(simulationInterval);
      } else {
        simulationInterval = setInterval(simulateTimeStep, mpf);
      }
      simulating = !simulating;
      console.log("Simulation running: " + simulating);
      break;
    case '+':
      fps = constrain(fps + 5, 0, 100);
      mpf = 1000 / fps;
      //if (simulating) {
      clearInterval(simulationInterval);
      simulationInterval = setInterval(simulateTimeStep, mpf);
      //}
      if (reporting) {
        clearInterval(reportInterval);
        reportInterval = setInterval(performanceReport, mpf);
      }
      console.log("++ Simulation rate: " + fps + " ticks per second.\nSimulation running: " + simulating + " ++");
      break;
    case '-':
      fps = constrain(fps - 5, 0, 100);
      if (fps === 0) {
        mpf = 0;
        if (simulating) {
          clearInterval(simulationInterval);
          simulating = !simulating;
        }
        if (reporting) {
          clearInterval(reportInterval);
          reporting = !reporting;
        }
      } else
        mpf = 1000 / fps;
      if (simulating) {
        clearInterval(simulationInterval);
        simulationInterval = setInterval(simulateTimeStep, mpf);
      }
      if (reporting) {
        clearInterval(reportInterval);
        reportInterval = setInterval(performanceReport, mpf);
      }

      console.log("-- Simulation rate: " + fps + " ticks per second.\nSimulation running: " + simulating + " --");
      break;
    case 's':
    case 'S':
      bubbles.forEach(function(bubble) {
        bubble.pop(0.5);
      });
      break;
  }

  return false;
}

function makeToggle() {
  if (simulating) {
    clearInterval(simulationInterval);
  } else {
    simulationInterval = setInterval(simulateTimeStep, mpf);
  }
  simulating = !simulating;
  console.log("Simulation running: " + simulating);
}
