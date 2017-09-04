var myCanvas;
var bubbles = [];
var virtualHeight = 1000;
var virtualWidth = 1000;
var fps = 30;
var mpf = 1000 / fps;
var minRadius = 20;
var maxRadius = 60;
var topSpeed = 20;
var numberOfBubbles = 0;
const initialColor = [255, 255, 255];
var searchSpace = 1.2 * (maxRadius + topSpeed);
let trackingGrid = [];
let gridX = ~~(virtualWidth / searchSpace);
let gridY = ~~(virtualHeight / searchSpace);
let gridSpanX = virtualWidth / gridX;
let gridSpanY = virtualHeight / gridY;
var simulationInterval, reportInterval, blobInterval;
var simulating = true,
  reporting = false;

// module aliases
var Engine = Matter.Engine,
    World = Matter.World,
    Bodies = Matter.Bodies,
    Body = Matter.Body;

// create an engine
var engine = Engine.create();
var world = engine.world;
//world.gravity = 0.5;


var screenEdges = [];

function ScreenEdge(x, y, w, h, c, l='wall'){
    this.body = Bodies.rectangle(x, y, w, h,{isStatic: true, friction: 0, frictionAir: 0, frictionStatic: 0, density: 1, label: l});
    this.body.owner = this;
    World.add(world, this.body);
    this.w = w;
    this.h = h;
    this.color = c;
}

function screenBox(){
    if (screenEdges.length > 0) {
	for(var bubble of screenEdges){
	    World.remove(world, bubble.body);
	    bubble.body = null;
	}
    }
    screenEdges[0] = new ScreenEdge(width/2,-90,width,200, [0, 255, 0],'Wall');
    screenEdges[1] = new ScreenEdge(width/2,height+90,width,200, [255, 0, 255],'Wall');
    screenEdges[2] = new ScreenEdge(-90,height/2,200,height, [255, 0, 0],'Wall');
    screenEdges[3] = new ScreenEdge(90+width,height/2,200,height, [0, 0, 255],'Wall');
}

function perpetualMotion(e) {
    for (var pair of e.pairs){
	var bodyA = pair.bodyA,
	    bodyB = pair.bodyB;
	if ((bodyA.label == 'bubble' && bodyA.label == 'Wall') ||
	    (bodyB.label == 'bubble' && bodyB.label == 'Wall')){
	    var bubbleBody = bodyA.label == 'bubble'? bodyA:bodyB,
		wallBody = bodyA.label == 'Wall'? bodyA:bodyB,
		velocityCorrection = 1;
	    if (bubbleBody.speed > topSpeed)
		velocityCorrection = 0.9;
	    else if (bubbleBody.speed < topSpeed * 0.1)
		velocityCorrection = 1.25;
	    Matter.Body.setVelocity(bubbleBody,
				    {x: velocityCorrection*bubbleBody.velocity.x,
				     y: velocityCorrection*bubbleBody.velocity.y});
	}
    }
}

function perpetualMotion2(e) {
    for (var pair of e.pairs){
	var bodyA = pair.bodyA,
	    bodyB = pair.bodyB,
	    sharedColor = interpolateColors(bodyA.owner.color, bodyB.owner.color, 0.5);
	
	for (var body of [bodyA, bodyB]){
	    var velocityCorrection = 1;
	    if (body.label == 'bubble') {
		if (body.speed > topSpeed)
		    velocityCorrection = 0.9;
		else if (body.speed < topSpeed * 0.2)
		    velocityCorrection = 1.12;
		Matter.Body.setVelocity(body,
					{x: velocityCorrection*body.velocity.x,
					 y: velocityCorrection*body.velocity.y});
		//Body.setAngularVelocity(body,{x:0,y:0});
		body.owner.color = sharedColor;
	    }
	}
    }
}


function setup() {
    myCanvas = createCanvas(windowWidth - 5, windowHeight - 5);
    ellipseMode(RADIUS);
    rectMode(CENTER);
    angleMode(RADIANS);
    virtualWidth = width;
    virtualHeight = height;
    const bubbleFactor = (~~(virtualWidth / searchSpace)) *
	  (~~(virtualHeight / searchSpace));
//    numberOfBubbles = bubbleFactor / log(minRadius * 1.42);
    updateGrid();
    for (let i = 0; i < numberOfBubbles; i++) {
	let //br = random(minRadius, maxRadius),
	br = i % (maxRadius - minRadius) + minRadius,
	    by = random(10 + br, virtualHeight - br - 10),
	    bx = random(10 + br, virtualWidth - br - 10),
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
		if (dist(bx, by, neighborhood[k].x, neighborhood[k].y) < 1.5 *
		    (br + neighborhood[k].radius)) {
		    br = i % (maxRadius - minRadius) + minRadius;
		    by = random(0 + br, virtualHeight - br);
		    bx = random(0 + br, virtualWidth - br);
		    found = 0;
		    tries++;
		    break;
		}
	    }
	}
	if (found) {
	    bubbles[i] = new Bubble(i, bx, by, br, initialColor);
	    addToGrid2(bubbles[i]);
	}
    }
    screenBox();
    world.gravity.y = 0;
    Matter.Events.on(engine, 'collisionEnd', perpetualMotion2);
    setInterval(()=>{Engine.update(engine, mpf);}, mpf);
    //simulationInterval = setInterval(simulateTimeStep, mpf);
}

function draw() {
    background(0xF, 0xF, 0xF, 0xFF);
    for(let edge of screenEdges){
	push();
	fill(edge.color);
	translate(edge.body.position.x, edge.body.position.y);
	rect(0, 0, edge.w, edge.h);
	pop();
    }
    for (let i = 0; i < bubbles.length; i++) {
      bubbles[i].display();
    }
}


function windowResized() {
    resizeCanvas(windowWidth - 5, windowHeight - 5);
    virtualWidth = width;
    virtualHeight = height;
    screenBox();
    console.log(virtualWidth + " x " + virtualHeight);
    updateGrid();
    let before = (bubbles.length);
    for (let i = 0; i < bubbles.length; i++) {
	const br = minRadius;
	let found = 0,
	    tries = 0,
	    by = random(0 + br, virtualHeight - br),
	    bx = random(0 + br, virtualWidth - br);
	while (found === 0 && bubbles.length > i) {
	    if (bubbles[i].x > width - bubbles[i].radius || bubbles[i].y > height - bubbles[i].radius) {
		if (tries == 500) {
		    tries = 0;
		    World.remove(world, bubbles[i].body);
		    bubbles.splice(i, 1);
		    found = 0;
		    continue;
		} else {
		    let neighbors = getNeighborhoodFromGrid(bx, by);
		    found = 1;
		    for (let k = 0; k < neighbors.length; k++) {
			if (dist(bx, by, neighbors[k].x, neighbors[k].y) <
			    (searchSpace - maxRadius - topSpeed)) {
			    by = random(0 + br, virtualHeight - br);
			    bx = random(0 + br, virtualWidth - br);
			    found = 0;
			    tries++;
			    break;
			}
		    }
		}

		if (found && i < bubbles.length) {
		    bubbles[i].radius = br;
		    bubbles[i].center = [bx, by];
		    bubbles[i].burst = 0.75;
		}
	    } else found = 1;
	}
    }
    console.log("Before: " + before + " After: " + bubbles.length);
};



function simulateTimeStep() {
}

/*
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
*/ 

/*
function mousePressed() {
  console.log("Pop bubbles at the mouse pointer.");
  var neighbors = getNeighborhoodFromGrid(mouseX, mouseY);
  for (var i = 0; i < neighbors.length; i++) {
    neighbors[i].pop();
  }
  flashNeighborhood(mouseX, mouseY, [255, 255, 255]);
}
*/

/*
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
  }

  return false;
}
*/
