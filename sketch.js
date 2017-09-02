var bubbles = [];
var virtualHeight;
var virtualWidth;
var fps = 30;
var mpf = 1000 / fps;
var drawTimes = [mpf];
var lastFrameTime = 0;
var minRadius = 8;
var maxRadius = 24;
var topSpeed = 5;
var numberOfBubbles = 140;
var initialColor = [255, 255, 255];
var initialAlpha = 0xBF;
var averageFrameRate = fps;
var recentFrameRates = [];
var innerLoopTimes = [];
var avefr = fps;
var reportTime = 0;
var screenWidth = 1840;
var screenHeight = 1000;
var maxBounces = 0;
var minBounces = 10;
var searchSpace = 2.2 * (maxRadius + topSpeed);



function setup() {
  createCanvas(windowWidth - 5, windowHeight - 5);
  virtualHeight = height;
  virtualWidth = width;
  bubbleFactor = (~~(virtualWidth / searchSpace)) * (~~(virtualHeight / searchSpace));
  numberOfBubbles = bubbleFactor / 1.3333; // random(bubbleFactor / 1.75, bubbleFactor / 1.33);
  lts = 0;
  bubbles[0] = new Bubble(virtualWidth / 2, virtualHeight / 2, random(minRadius, maxRadius), initialColor, initialAlpha);
  for (var i = 1; i < numberOfBubbles; i++) {
    var br, bx, by, found = 0;

    while (found != 1 && bubbles.length > 0) {
      br = i % (maxRadius - minRadius) + minRadius; //random(minRadius, maxRadius);
      by = random(0 + br, virtualHeight - br);
      bx = random(0 + br, virtualWidth - br);
      found = 1;
      ts = window.performance.now();
      for (var k = 0; k < i; k++) {
        if (dist(bx, by, bubbles[k].x, bubbles[k].y) < 1.5 * (br + bubbles[k].radius)) {
          found = 0;
          break;
        }
      }
      lts += (window.performance.now() - ts)
    }
    bubbles[i] = new Bubble(bx, by, br, initialColor, initialAlpha);
  }
  bubbles.sort(function(a, b) {
    if (a.radius < b.radius) return -1;
    if (a.radius == b.radius) return 0;
    if (a.radius > b.radius) return 1;
  });
  console.log(lts);
}

function draw() {
  ts = window.performance.now();
  let gridX = ~~(virtualWidth / searchSpace);
  let gridY = ~~(virtualHeight / searchSpace);
  let gridSpanX = virtualWidth / gridX;
  let gridSpanY = virtualHeight / gridY;

  let trackingGrid = [];
  for (var i = 0; i < gridY * gridX; i++) {
    trackingGrid[i] = [];
  }

  for (var i = 0; i < bubbles.length; i++) {
    let tx = ~~(bubbles[i].x / gridSpanX);
    let ty = ~~(bubbles[i].y / gridSpanY);
    //console.log(tx + " " + ty);
    for (var k = constrain(ty - 1, 0, gridY - 1); k <= constrain(ty + 1, 0, gridY - 1); k++) {
      for (var j = constrain(tx - 1, 0, gridX - 1); j <= constrain(tx + 1, 0, gridX - 1); j++) {
        Array.isArray(trackingGrid[k * gridX + j]) ? trackingGrid[k * gridX + j].push(bubbles[i]) : trackingGrid[k * gridX + j] = [bubbles[i]];
      }
    }
  }

  let ilc = 0;
  for (var i = 0; i < bubbles.length; i++) {
    /*    for (var j = 0; j < bubbles.length; j++) {
          bubbles[i].collision(bubbles[j]);
        }*/
    let tx = ~~(bubbles[i].x / gridSpanX);
    let ty = ~~(bubbles[i].y / gridSpanY);
    for (var j = 0; j < trackingGrid[ty * gridX + tx].length; j++) {
      bubbles[i].collision(trackingGrid[ty * gridX + tx][j]);
      ilc++;
      //console.log(trackingGrid[ty * gridX + tx].length);
    }
  }
  //console.log(ilc);
  for (var i = 0; i < bubbles.length; i++) {
    bubbles[i].move(bubbles);
    bubbles[i].neighbors = [];
  }
  //minBounces = bubbles[0] + 10;
  //for (var i = 0; i < bubbles.length; i++) {
  //maxBounces = max(maxBounces, bubbles[i].bounces);
  //minBounces = min(minBounces, bubbles[i].bounces);

  //}
  /*bubbles.sort(function(a, b) {
    if (a.bounces < b.bounces) return -1;
    if (a.bounces == b.bounces) return 0;
    if (a.bounces > b.bounces) return 1;
    });*/
  ilt = window.performance.now() - ts;

  while (recentFrameRates.length > fps * 10) {
    recentFrameRates.shift();
    innerLoopTimes.shift();
  }
  recentFrameRates.push(frameRate());
  innerLoopTimes.push(ilt);

  if (window.performance.now() - reportTime > 10000) {
    var iltSum = 0;
    var iltVariance = 0;
    var tmpSum = 0;
    var tmpVariance = 0;
    for (var i = 0; i < recentFrameRates.length; i++) {
      tmpSum += recentFrameRates[i];
      iltSum += innerLoopTimes[i];
    }
    avefr = tmpSum / recentFrameRates.length;
    aveilt = iltSum / innerLoopTimes.length;
    averageFrameRate = (3 * averageFrameRate + avefr) / 4;
    for (var i = 0; i < recentFrameRates.length; i++) {
      tmpVariance += ((avefr - recentFrameRates[i]) ** 2);
      iltVariance += ((aveilt - innerLoopTimes[i]) ** 2);
    }
    console.log("++++Frame Rates++++\n10 second average:\n" + avefr +
      "\nstandard deviation:\n" + (sqrt(tmpVariance / recentFrameRates.length)) +
      "\nrunning average:\n" + averageFrameRate);
    console.log("++++Inner Loop Times++++\n10 second average:\n" + aveilt +
      "\nstandard deviation:\n" + (sqrt(iltVariance / innerLoopTimes.length))); // + "\nrunning average:\n" + averageFrameRate);
    reportTime = window.performance.now();
  }
  dt = 0;
  for (var i = 0; i < drawTimes.length; i++) dt += drawTimes[i];
  dt = dt / drawTimes.length;
  dt = lastFrameTime - dt;
  mpf = 1000 / fps;
  while (window.performance.now() - dt < mpf) {}

  dt = window.performance.now();
  background(0xF, 0xF, 0xF, 0xBF);
  for (var i = 0; i < bubbles.length; i++) {
    bubbles[i].display(i, bubbles.length);
  }
  lastFrameTime = window.performance.now();

  while (drawTimes.length > 2 * fps) {
    drawTimes.shift();
  }
  drawTimes.push(lastFrameTime - dt);
}

function windowResized() {
  resizeCanvas(windowWidth - 5, windowHeight - 5);
  virtualWidth = width;
  virtualHeight = height;
  maxBubbles = (~~(virtualWidth / searchSpace)) * (~~(virtualHeight / searchSpace)) / 1.33;
  console.log(maxBubbles);
  console.log(bubbles.length);
  for (var i = 0; i < bubbles.length; i++) {
    found = 0;
    tries = 0;
    if (bubbles[i].x > width - bubbles[i].radius || bubbles[i].y > height - bubbles[i].radius) {
      while (found != 1) {
        if (tries == 25000) {
          tries = 0;
          bubbles.splice(i, 1);
          continue;
        }
        br = bubbles[i].radius
        by = random(0 + br, virtualHeight - br);
        bx = random(0 + br, virtualWidth - br);
        found = 1;
        for (var k = 0; k < bubbles.length; k++) {
          if (dist(bx, by, bubbles[k].x, bubbles[k].y) < searchSpace - topSpeed) {
            found = 0;
            break;
          }
        }
        tries++;
      }
      bubbles[i].x = bx;
      bubbles[i].y = by;
    }
  }
  console.log(bubbles.length);
};
