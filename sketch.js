var bubbles = [];
var virtualHeight;
var virtualWidth;
var fps = 30;
var mpf = 1000 / fps;
var lastFrameTime = 0;
var minRadius = 12;
var maxRadius = 32;
var topSpeed = 7.5;
var numberOfBubbles = 101;
var initialColor = [255, 255, 255];
var initialAlpha = 0xDF;


function setup() {
  createCanvas(900, 900);
  virtualHeight = height;
  virtualWidth = width;
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
  if (millis() - lastFrameTime <= mpf) return;

  background(0xF, 0xF, 0xF, 0xFF);
  var maxBounces = 0;
  var minBounces = bubbles[0].maxBounces;
  //for (var k = 0; k < 3; k++)
  for (var i = 0; i < bubbles.length; i++) {
    for (var j = i; j < bubbles.length; j++) {
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
  })
  var systemSpeed = 0;
  var systemForce = 0;
  for (var i = 0; i < bubbles.length; i++) {
    systemSpeed += bubbles[i].momentum[1];
    systemForce += bubbles[i].momentum[1] * bubbles[i].radius;
    bubbles[i].maxBounces = maxBounces;
    bubbles[i].minBounces = minBounces;
    bubbles[i].display(i, bubbles.length);

  }
  //console.log(systemSpeed);
  //console.log(systemForce);
  lastFrameTime = millis();
}
