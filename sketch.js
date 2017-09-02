var bubbles = [];
var virtualHeight;
var virtualWidth;
var fps = 30;
var mpf = 1000 / fps;
var lastFrameTime = 0;
var minRadius = 8;
var maxRadius = 24;
var topSpeed = 16;
var numberOfBubbles = 400;
var initialColor = [255, 255, 255];
var initialAlpha = 0xDF;
var averageFrameRate = 60;
var recentFrameRates = [];
var avefr = 60;
var reportTime = 0;
var screenWidth = 1840;
var screenHeight = 1000;

var squares = [];
for (var i = 0; i < 2000; i++) squares[i] = i * i;

var roots = [];


var searchSpace = 2.2 * (maxRadius + topSpeed);
for (var i = 0; i < 3 * searchSpace * searchSpace; i++) roots[i] = Math.sqrt(i);

function wobble(target) {
  return (1.025 - millis() % 1 * 0.05) * target;
};

function setup() {
  createCanvas(windowWidth - 5, windowHeight - 5);
  virtualHeight = height;
  virtualWidth = width;
  bubbleFactor = (~~(virtualWidth / searchSpace)) * (~~(virtualHeight / searchSpace)) * 0.5;
  numberOfBubbles = random(bubbleFactor / 5, bubbleFactor / 2);
  lts = 0;
  bubbles[0] = new Bubble(virtualWidth / 2, virtualHeight / 2, random(minRadius, maxRadius), initialColor, initialAlpha);
  for (var i = 1; i < numberOfBubbles; i++) {
    var br, bx, by, found = 0;

    while (found != 1 && bubbles.length > 0) {
      br = random(minRadius, maxRadius);
      by = random(0 + br, virtualHeight - br);
      bx = random(0 + br, virtualWidth - br);
      found = 1;
      ts = millis();
      for (var k = 0; k < i; k++) {
        if (dist(bx, by, bubbles[k].x, bubbles[k].y) < 1.5 * (br + bubbles[k].radius)) {
          found = 0;
          break;
        }
      }
      lts += (millis() - ts)
    }
    bubbles[i] = new Bubble(bx, by, br, initialColor, initialAlpha);
  }
  console.log(lts);
}

function draw() {
  if (recentFrameRates.length > 600) recentFrameRates.shift();
  recentFrameRates.push(frameRate());
  if (millis() - lastFrameTime < mpf) return;

  background(0xF, 0xF, 0xF, 0xFF);
  var maxBounces = 0;
  var minBounces = bubbles[0].maxBounces;
  //for (var k = 0; k < 3; k++)
  for (var i = 0; i < bubbles.length; i++) {
    for (var j = 0; j < bubbles.length; j++) {
      bubbles[i].collision(bubbles[j], bubbles);
    }
  }
  for (var i = 0; i < bubbles.length; i++) {
    bubbles[i].move(bubbles);
  }
  for (var i = 0; i < bubbles.length; i++) {
    maxBounces = max(maxBounces, bubbles[i].bounces);
    minBounces = min(minBounces, bubbles[i].bounces);
  }
  bubbles.sort(function(a, b) {
    if (a.bounces < b.bounces) return -1;
    if (a.bounces == b.bounces) return 0;
    if (a.bounces > b.bounces) return 1;
  });
  var systemSpeed = 0;
  var systemForce = 0;
  for (var i = 0; i < bubbles.length; i++) {
    /*systemSpeed += bubbles[i].momentum[1];
    systemForce += bubbles[i].momentum[1] * bubbles[i].radius;*/
    bubbles[i].maxBounces = maxBounces;
    bubbles[i].minBounces = minBounces;
    bubbles[i].display(i, bubbles.length);
    bubbles[i].neighbors = [];
  }
  //console.log(systemSpeed);
  //console.log(systemForce);


  if (millis() - reportTime > 10000) {
    var tmpSum = 0;
    var tmpVariance = 0;
    for (var i = 0; i < recentFrameRates.length; i++) {
      tmpSum += recentFrameRates[i];
    }
    avefr = tmpSum / recentFrameRates.length;
    averageFrameRate = (3 * averageFrameRate + avefr) / 4;
    for (var i = 0; i < recentFrameRates.length; i++) tmpVariance += ((avefr - recentFrameRates[i]) ** 2);
    console.log("10 second average:\n" + avefr + "\nstandard deviation:\n" + (sqrt(tmpVariance / recentFrameRates.length)) + "\nrunning average:\n" + averageFrameRate);
    reportTime = millis()

  }


  lastFrameTime = millis();
}

function windowResized() {
  resizeCanvas(windowWidth - 5, windowHeight - 5);
  virtualWidth = width;
  virtualHeight = height;
  maxBubbles = (~~(virtualWidth / searchSpace)) * (~~(virtualHeight / searchSpace)) / 1.33;
  console.log(maxBubbles);
  for (var i = 0; i < bubbles.length; i++) {
    found = 0;
    tries = 0;
    if (bubbles[i].x > width - bubbles[i].radius || bubbles[i].y > height - bubbles[i].radius) {
      while (found != 1) {
        if (tries == 500) {
          tries = 0;
          bubbles.splice(i, 1);
          continue;
        }
        br = bubbles[i].radius
        by = random(0 + br, virtualHeight - br);
        bx = random(0 + br, virtualWidth - br);
        found = 1;
        for (var k = 0; k < bubbles.length; k++) {
          if (dist(bx, by, bubbles[k].x, bubbles[k].y) < searchSpace) {
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
};
