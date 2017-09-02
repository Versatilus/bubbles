var myCanvas;
var bubbles = [];
var virtualHeight = 1000;
var virtualWidth = 1000;
var fps = 25;
var mpf = 1000 / fps;
var drawTimes = [mpf];
var lastFrameTime = 0;
var minRadius = 4;
var maxRadius = 48;
var topSpeed = 15;
var numberOfBubbles = 25;
const initialColor = [255, 255, 255];
const initialAlpha = 0xBF;
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
var simulationInterval, reportInterval, blobInterval;
var simulating = true,
  reporting = false;


var roots = [];


var img;
var blobGridX;
var blobGridY;
var blobGridXFactor;
var blobGridYFactor;
var blobGridXScale = 1;
var blobGridYScale = 1;

function calculateBlobGrid(xScale, yScale) {
  blobGridXScale = typeof(xScale) === 'number' ? xScale : typeof(blobGridXScale) === 'number' ? blobGridXScale : 1;
  blobGridYScale = typeof(yScale) === 'number' ? yScale : typeof(blobGridYScale) === 'number' ? blobGridYScale : 1;
  blobGridX = ~~(gridSpanX * blobGridXScale);
  blobGridY = ~~(gridSpanY * blobGridYScale);
  blobGridXFactor = virtualWidth / blobGridX;
  blobGridYFactor = virtualHeight / blobGridY;
  img = createGraphics(blobGridX, blobGridY);
  roots = [];
  for (var zz = 0; zz < ~~(1.1 * (virtualHeight ** 2 + virtualWidth ** 2)); zz++) roots[zz] = Math.sqrt(zz);
}


function preload() {
  //img = loadImage("resources/crack.jpg");
}



function setup() {
  pixelDensity(1);
  myCanvas = createCanvas(windowWidth - 5, windowHeight - 5);
  strokeWeight(3);
  ellipseMode(RADIUS);
  virtualWidth = width;
  virtualHeight = height;
  const bubbleFactor = (~~(virtualWidth / searchSpace)) * (~~(virtualHeight / searchSpace));
  numberOfBubbles = bubbleFactor / log(minRadius * 1.42); // random(bubbleFactor / 1.75, bubbleFactor / 1.33);
  let lts = 0;
  //bubbles[0] = new Bubble(0, virtualWidth / 2, virtualHeight / 2, random(minRadius, maxRadius), initialColor, initialAlpha);
  updateGrid();
  for (let i = 0; i < numberOfBubbles; i++) {
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
      bubbles[i] = new Bubble(i, bx, by, br, initialColor, initialAlpha);
      addToGrid2(bubbles[i]);
    }
  }
  console.log(lts);
  simulationInterval = setInterval(simulateTimeStep, mpf);
  console.log("20170822_114438");
  calculateBlobGrid();
  blobInterval = setInterval(metaball, mpf * 2);
}

function draw() {
  if (simulateFlag || drawingFlag) return;
  drawingFlag = 1;
  //vamr background(0xF, 0xF, 0xF, 0x7F);
  /*
    for (let i = 0; i < bubbles.length; i++) {
      bubbles[i].display();
    }*/

  image(img, 0, 0, virtualWidth, virtualHeight, 0, 0, blobGridX, blobGridY);
  drawingFlag = 0;
  /*push();
  noFill();
  stroke([255, 0, 0, 0x7F]);
  strokeWeight(3);
  ellipse(mouseX, mouseY, 18, 18);
  line(mouseX - 22, mouseY, mouseX + 22, mouseY);
  line(mouseX, mouseY - 22, mouseX, mouseY + 22);
  pop();*/
  lastFrameTime = window.performance.now();
}


var minColor = 500124;
var maxColor = 0;
var averageColor = 0;

function calculatePixels() {
  var pixelColor, colorScaler = log(bubbles.length + (maxRadius + minRadius)) * 2,
    currentColorMin = 500012,
    currentColorMax = 0,
    currentColorTotal = 0;
  var idx, x, y, index, scaledX, scaledY;
  var p = new Parallel(bubbles);
  var colormap = [];
  for (y = 0; y < blobGridY; y++) {
    scaledY = y * blobGridYFactor;
    for (x = 0; x < blobGridX; x++) {
      scaledX = x * blobGridXFactor;
      idx = (x + y * blobGridX);
      colormap[idx] = p.map(function colorPixel(bubble) {
          var pc = (bubble.radius + 1) / ((abs(bubble.x - scaledX) + abs(bubble.y - scaledY)) + 0.5);
          pc += (1 + colorScaler * bubble.radius) / (roots[~~((bubble.x - scaledX) ** 2 + (bubble.y - scaledY) ** 2)] + 0.5);
          return pc;
        })
        .reduce(function sum(prev, curr) {
          return prev + curr
        }, 0);

      currentColorMin = min(currentColorMin, colormap[idx]);
      currentColorMax = max(currentColorMax, colormap[idx]);
      currentColorTotal += colormap[idx];
    }
  }
  return colormap;
}

function metaball() {
  var pixelColor;
  var idx, xy, index;
  var colormap = calculatePixels();
  xy = colormap.length
  img.loadPixels();
  for (idx = 0; idx < xy; idx++) {
    let rgb = hslToRgb(constrain(map(colormap[idx], minColor, (minColor * log(maxColor) / log(minColor)), 0, 0.833), 0, 1), 1, 0.5);
    index = 4 * idx;
    img.pixels[index] = rgb[0];
    img.pixels[index + 1] = rgb[1];
    img.pixels[index + 2] = rgb[2];
    img.pixels[index + 3] = 127;
  }
  img.updatePixels();
}

function windowResized() {
  resizeCanvas(windowWidth - 5, windowHeight - 5);
  virtualWidth = width;
  virtualHeight = height;
  console.log(virtualWidth + " x " + virtualHeight);
  while (drawingFlag || simulateFlag) {}
  drawingFlag = 1;

  updateGrid();
  calculateBlobGrid();
  let before = (bubbles.length);
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
    } */
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
          //bubbles[i].x = bx;
          //bubbles[i].y = by;
          bubbles[i].center = [bx, by];
          bubbles[i].burst = 0.75;
          //addToGrid(bubbles[i]);
        }
      } else found = 1;
    }
  }
  //simulateFlag = 0;
  drawingFlag = 0;
  /*if (!simulating) {
    simulateTimeStep();
    draw();
  }*/
  console.log("Before: " + before + " After: " + bubbles.length);
};



function simulateTimeStep() {
  while (drawingFlag || simulateFlag) {}
  simulateFlag = 1;
  for (let i = 0; i < bubbles.length; i++) {
    neighborhood = getNeighborhoodFromGrid(bubbles[i].x, bubbles[i].y);
    for (let j = 0; j < neighborhood.length; j++) {
      bubbles[i].collision(neighborhood[j]);
    }
    bubbles[i].move()
    if (bubbles[i].burst) {
      bubbles[i].history = [];
      const intensity = bubbles[i].burst;
      bubbles[i].burst = 0;
      const concentrated = concentrateColor(bubbles[i].color);
      //fill(concentrated, 255);
      //ellipse(bubbles[i].x, bubbles[i].y, 2 * (bubbles[i].farthestNeighbor + maxRadius), 2 * (bubbles[i].farthestNeighbor + maxRadius));
      flashNeighborhood(bubbles[i].x, bubbles[i].y, (concentrated)); // [255, 255, 255]);
      for (let j = 0; j < bubbles[i].neighbors.length; j++) {
        if (bubbles[i] === bubbles[i].neighbors[i]) continue;
        bubbles[i].neighbors[j].color = interpolateColors(concentrated, bubbles[i].neighbors[j].color, intensity);
      }
      //bubbles[i].color = invertColor(bubbles[i].color);
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
      //bubble.color = [255];
      bubble.pop(1);
    });
    children.forEach(function(bubble) {
      bubble.color = [0, 255, 255];
      //  bubble.color = [0];
      bubble.pop(0.25);
    });
    if (neighbors.length)
      flashNeighborhood(mouseX, mouseY, [255, 255, 255]);
  }
  simulateFlag = 0;
}

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
}

function mousePressed() {
  console.log("Pop bubbles at the mouse pointer.");
  var neighbors = getNeighborhoodFromGrid(mouseX, mouseY);
  for (var i = 0; i < neighbors.length; i++) {
    neighbors[i].pop();
  }
  flashNeighborhood(mouseX, mouseY, [255, 255, 255]);
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
      console.log("Scattering bubbles.");
      bubbles.forEach(function(bubble) {
        bubble.pop(0.5);
      });
      break;
      //case 't':
      /*case 'T':
        console.log("Running benchmark...\n");
        benchmarker();
        break;*/
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


function benchmarker() {
  var oltSum = 0,
    oltAverage = 0,
    oltVariance = 0,
    benchmarkStop = 0;
  simulating = 0;
  clearInterval(simulationInterval);
  var olTimes = [];
  while (drawingFlag) {}
  //noLoop();
  var benchmarkStart = window.performance.now();
  for (var ii = 0; ii < fps * 60 * 25; ii++) {
    var oltStart = window.performance.now();
    simulateTimeStep();
    olTimes.push(window.performance.now() - oltStart);
  }
  benchmarkStop = window.performance.now();
  //loop();
  olTimes.forEach(function(olt) {
    oltSum += olt;
  });
  oltAverage = oltSum / olTimes.length;
  olTimes.forEach(function(olt) {
    oltVariance += (oltAverage - olt) ** 2;
  });
  console.log("++++LoopTimes++++\nAverage:\n" + oltAverage + "\nStandard Deviation:\n" + (sqrt(oltVariance / olTimes.length)) + "\nElapsed Time: " + (benchmarkStop - benchmarkStart));
}
