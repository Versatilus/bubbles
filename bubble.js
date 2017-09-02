var bubbleDimensions = [];

function Bubble(id, x, y, radius, coloration, alpha) {
  this.id = id >= 0 ? ~~id : ~~random(65536, 16776216);
  _radius = radius ? radius : random(maxRadius);
  _x = x ? x : random(virtualWidth);
  _y = y ? y : random(virtualHeight);
  _center = [_x, _y];
  this.color = coloration ? coloration.slice() : [255, 255, 255];
  this.alpha = alpha ? alpha : 127;


  this.startColor = this.color.slice();
  this.bounces = 0;
  this.maxBounces = 0;
  this.minBounces = 0;
  this.lastCollision = 0;
  _elasticity = random(0.51, 0.650);
  this._neighbors = [];
  this.burst = 0;
  this.growing = 0;
  this.topSpeed = topSpeed * random(0.9, 1.1);
  this.history = [createVector(x, y)];
  _xspeed = random(-this.topSpeed / 3, this.topSpeed / 3);
  _yspeed = random(-this.topSpeed / 3, this.topSpeed / 3);
  this.farthestNeighbor = 0;
  this.hasPopped = 0;
  bubbleDimensions[id] = [_center[0], _center[1], _radius, _xspeed, _yspeed, _elasticity];
}

Bubble.prototype.shareColor = function(other) {
  const radii = (this.radius + other.radius) / 2;
  const thisWeight = this.radius / radii;
  const otherWeight = other.radius / radii;
  let tmpColor = [];
  for (let i = 0; i < this.color.length; i++) {
    tmpColor[i] = sqrt(((thisWeight) * (this.color[i] ** 2) + (otherWeight) * (other.color[i] ** 2)) / 2);
    other.color[i] = tmpColor[i];
  }
  this.color = tmpColor.slice();
};

Bubble.prototype.move = function(others) {
  if (this.x - this.radius <= 0) {
    this.growing = 0.25;
    this.xspeed *= random(-1.025, -0.975);
    //this.color = interpolateColors(this.color, [0], 0.05);
    this.color = interpolateColors(this.color, [255, 0, 0], 0.5);
    this.bounces++;
  } else if (this.x + this.radius >= virtualWidth) {
    this.growing = 0.25;
    this.xspeed *= random(-1.025, -0.975);
    //this.color = interpolateColors(this.color, [255], 0.5);
    this.color = interpolateColors(this.color, [0, 0, 255], 0.5);
    this.bounces++;
  }
  if (this.y - this.radius <= 0) {
    this.growing = 0.5;
    this.yspeed *= random(-1.025, -0.975);
    //this.color = interpolateColors(this.color, [0], 0.05);
    this.color = interpolateColors(this.color, [0, 255, 0], 0.5);
    this.bounces++;
  } else if (this.y + this.radius >= virtualHeight) {
    this.growing = 0.5;
    this.yspeed *= random(-1.025, -0.975);
    //this.color = interpolateColors(this.color, [255], 0.5);
    this.color = interpolateColors(concentrateColor(this.color), this.color, 0.25);
    this.bounces++;
  }
  if (this.radius > maxRadius) {
    //this.color = [0]; // interpolateColors(this.color, [255], 0.5);
    this.radius = minRadius;
    //this.burst = 0.25;
    this.pop(0.075);
  }

  /*for (let i = 0; i < this.neighbors.length; i++) {
    if (this.radius / this.neighbors[i].radius > 2 || this.neighbors[i].radius / this.radius > 2 || this === this.neighbors[i]) continue;
    //if (this === this.neighbors[i]) continue; //this.radius / this.neighbors[i].radius > 2 || this.neighbors[i].radius / this.radius > 2 || this === this.neighbors[i]) continue;
    const distance = dist(this.x + this.xspeed, this.y + this.yspeed, this.neighbors[i].x, this.neighbors[i].y);
    //this.farthestNeighbor = max(distance, this.farthestNeighbor);
    if (distance < this.radius + this.growing + this.neighbors[i].radius + this.neighbors[i].growing) {
      this.history.push(createVector(this.x, this.y));
      if (this.history.length - (fps * 5) > 0) {
        let counter = 0,
          xSum = 0,
          ySum = 0;
        for (var j = this.history.length - (fps * 5); j < this.history.length; j++) {
          counter++;
          xSum += this.history[j].x;
          ySum += this.history[j].y;
        }
        const xAverage = xSum / counter;
        const yAverage = ySum / counter;
        //if (xAverage > virtualWidth) console.log(xAverage);
        //if (2 * searchSpace > this.x > virtualWidth - searchSpace * 2 || searchSpace * 2 > this.y > virtualHeight - searchSpace * 2)
        //console.log(xAverage + " " + yAverage + "\n" + this.x + " " + this.y);
        if (1.0125 * xAverage > this.x && this.x > 0.9875 * xAverage && 1.0125 * yAverage > this.y && this.y > 0.9875 * yAverage) {
          //this.radius = minRadius;
          //this.color = [0];
          this.pop(0.95);
          console.log(this.x + " " + this.y);
        }
      }
      return;
    }
}*/
  //if (this.neighbors.length > 0) return;
  this.radius += this.growing;
  this.growing = 0;
  this.center = [this.x + this.xspeed, this.y + this.yspeed];
  //this.history.push(createVector(this.x, this.y));
}

Bubble.prototype.collision = function(other) {
  return;
  if (this.radius / other.radius > 2 || other.radius / this.radius > 2 || this === other) return;
  //if (this === other) return; //this.radius / other.radius > 2 || other.radius / this.radius > 2 || this === other) return;
  const xDistance = this.x + this.xspeed - other.x;
  const yDistance = this.y + this.yspeed - other.y;
  //if (abs(xDistance) > searchSpace - 2 * topSpeed && abs(yDistance) > searchSpace - 2 * topSpeed) return;
  const distance = sqrt(xDistance ** 2 + yDistance ** 2);
  var growthFactor = (0.0625 * (minRadius / this.radius));
  if (distance <= (this.radius + other.radius + growthFactor)) {
    this.growing = growthFactor; // (0.0625 * (maxRadius / (this.radius + (maxRadius - minRadius))));
    //other.radius += 0.25;
    //this.lastCollision = other;
    const myWeight = (this.radius);
    const otherWeight = (other.radius);
    const weightRatio = myWeight / otherWeight;
    const distanceFactor = 0.25;

    var myCosTheta = xDistance / distance;
    var mySinTheta = yDistance / distance;

    var thisVector = this.momentum;
    var otherVector = other.momentum;

    //var thisRelative = acos(1);

    var bounceForce = (thisVector[1] * this.elasticity * weightRatio + otherVector[1] * other.elasticity / weightRatio);
    var thisXBounce = cos(thisVector[0] + Math.PI) * bounceForce;
    var thisYBounce = sin(thisVector[0] + Math.PI) * bounceForce;
    var otherXBounce = cos(otherVector[0] + Math.PI) * bounceForce;
    var otherYBounce = sin(otherVector[0] + Math.PI) * bounceForce;

    var xSum = (this.xspeed * weightRatio + other.xspeed / weightRatio); // this.xspeed + other.xspeed; //
    var ySum = (this.yspeed * weightRatio + other.yspeed / weightRatio); // this.yspeed + other.yspeed; //
    /*var myXSum = weightRatio * this.xspeed - other.xspeed/weightRatio;
    var myYSum = weightRatio * (this.yspeed - other.yspeed);
    var otherXSum = (this.xspeed - other.xspeed) / weightRatio;
    var otherYSum = (this.yspeed - other.yspeed) / weightRatio;*/


    this.xspeed = thisXBounce + xSum * random(0.975, 1.025) * distanceFactor;
    this.yspeed = thisYBounce + ySum * random(0.975, 1.025) * distanceFactor;
    other.xspeed = otherXBounce + xSum * random(0.975, 1.025) * distanceFactor;
    other.yspeed = otherYBounce + ySum * random(0.975, 1.025) * distanceFactor;
    this.shareColor(other);
    this.bounces++;
    other.bounces++;
  }

}

/*this.bounce = function(otherBubble) {
  var temp = [];
  for (var i = 0; i < 3; i++) {
    this.color[i] = Math.sqrt((this.color[i] ** 2) + (otherBubble.color[i] ** 2))
  }
  this.alpha = (this.alpha + otherBubble.alpha) / 2;
};*/


Bubble.prototype.display = function() {
  stroke((this.color));
  //fill(this.color, this.alpha);
  noFill();
  ellipse(this.x, this.y, this.radius, this.radius);
}

Bubble.prototype.teleport = function() {
  //updateGrid();
  const br = this.radius + 1;
  let found = 0,
    tries = 0;
  let bx = random(0 + br, virtualWidth - br),
    by = random(0 + br, virtualHeight - br);
  while (!found) {
    if (tries == 500) {
      return 0;
    }
    found = 1;
    let neighbors = getNeighborhoodFromGrid(bx, by);
    for (let i = 0; i < neighbors.length; i++) {
      if (dist(bx, by, neighbors[i].x, neighbors[i].y) < 2.1 * (br + maxRadius + topSpeed)) {
        found = 0;
        tries++;
        bx = random(0 + br, virtualWidth - br);
        by = random(0 + br, virtualHeight - br);
        break;
      }
    }
  }
  this.topSpeed = topSpeed * random(0.75, 1.25);
  this.xspeed = random(-this.topSpeed, this.topSpeed);
  this.yspeed = random(-this.topSpeed, this.topSpeed);
  this.center = [bx, by];
  return 1;
};

Bubble.prototype.pop = function(intensity) {
  this.history = [];
  /*const concentrated = concentrateColor(this.color);
  //fill(concentrated, 255);
  flashNeighborhood(this.x, this.y, concentrated);
  //ellipse(this.x, this.y, 2 * (this.farthestNeighbor), 2 * (this.farthestNeighbor));
  for (let j = 0; j < this.neighbors.length; j++) {
    if (this === this.neighbors[j]) continue;
    this.neighbors[j].color = interpolateColors(concentrated, this.neighbors[j].color, intensity);
  }*/
  this.radius = minRadius;
  //this.color = invertColor(this.color);
  return this.teleport();
}

Object.defineProperties(Bubble.prototype, {
  'x': {
    get: function() {
      return bubbleDimensions[this.id][0];
    },
    set: function(xval) {
      //this.hasMoved = 1;
      let older = getGridCoordinates(this.x, this.y);
      let newer = getGridCoordinates(xval, this.y);
      if (older[0] != newer[0]) {
        removeFromGrid2(this);
        bubbleDimensions[this.id][0] = constrain(xval, 0 + this.radius, virtualWidth - this.radius);
        addToGrid2(this);
      } else {
        bubbleDimensions[this.id][0] = constrain(xval, 0 + this.radius, virtualWidth - this.radius);
      }
    },
  },
  'y': {
    get: function() {
      return bubbleDimensions[this.id][1];
    },
    set: function(yval) {
      //this.hasMoved = 1;
      let older = getGridCoordinates(this.x, this.y);
      let newer = getGridCoordinates(this.x, yval);
      if (older[1] != newer[1]) {
        removeFromGrid2(this);
        bubbleDimensions[this.id][1] = constrain(yval, 0 + this.radius, virtualHeight - this.radius);
        addToGrid2(this);
      } else {
        bubbleDimensions[this.id][1] = constrain(yval, 0 + this.radius, virtualHeight - this.radius);
      }
    },
  },
  'center': {
    get: function() {
      return bubbleDimensions[this.id].slice(0, 2);
    },
    set: function(xyval) {
      //this.hasMoved = 1;
      let older = getGridCoordinates(this.x, this.y);
      let newer = getGridCoordinates(xyval[0], xyval[1]);
      if (older[0] != newer[0] || older[1] != newer[1]) {
        removeFromGrid2(this);
        bubbleDimensions[this.id][0] = constrain(xyval[0], 0 + this.radius, virtualWidth - this.radius);
        bubbleDimensions[this.id][1] = constrain(xyval[1], 0 + this.radius, virtualHeight - this.radius);
        addToGrid2(this);
      } else {
        bubbleDimensions[this.id][0] = constrain(xyval[0], 0 + this.radius, virtualWidth - this.radius);
        bubbleDimensions[this.id][1] = constrain(xyval[1], 0 + this.radius, virtualHeight - this.radius);
      }
    },
  },
  'xspeed': {
    get: function() {
      return bubbleDimensions[this.id][3];
    },
    set: function(x) {
      //this._xspeed = x !== 0 ? constrain(x, -this.topSpeed, this.topSpeed) : random(-0.01, 0.01);
      bubbleDimensions[this.id][3] = constrain(x, -this.topSpeed, this.topSpeed);
    }
  },
  'yspeed': {
    get: function() {
      return bubbleDimensions[this.id][4];
    },
    set: function(x) {
      bubbleDimensions[this.id][4] = constrain(x, -this.topSpeed, this.topSpeed);
    }
  },
  'momentum': {
    get: function() {
      var retval = [];
      retval[1] = sqrt(this.xspeed ** 2 + this.yspeed ** 2);
      retval[0] = acos(this.xspeed / retval[1]) * (this.yspeed < 0 ? -1 : 1);
      return retval;
    },
    set: function(x) {
      this.yspeed = sin(x[0]) * x[1];
      this.xspeed = cos(x[0]) * x[1];
    }
  },
  'energy': {
    get: function() {
      return (this.radius ** 2) * this.momentum[1];
    }
  },
  'diameter': {
    get: function() {
      return this.radius * 2;
    },
    set: function(x) {
      this.radius = x / 2;
    }
  },
  'radius': {
    get: function() {
      return bubbleDimensions[this.id][2];
    },
    set: function(x) {
      bubbleDimensions[this.id][2] = x;
    }
  },
  'neighbors': {
    get: function() {
      //var i = 0,        moved = this.hasMoved;
      //while (!moved && i < this._neighbors.length) {
      //moved = this._neighbors[i].hasMoved;
      //i++;
      //}
      /*if (moved) {
        //this._neighbors = [];
        //while (this._neighbors.length > 0) this._neighbors.pop();
        var tmp = (getNeighborhoodFromGrid(this.x, this.y))
          .slice();
        //for (let i = 0; i < tmp.length; i++)
        //if (tmp[i] !== this) this._neighbors.push(tmp[i]);
        while ((i = tmp.indexOf(this)) !== -1) tmp.splice(i, 1);
        this._neighbors = tmp;
        this.hasMoved = 0;
      }*/
      this._neighbors = getNeighborhoodFromGrid(this.x, this.y);
      return this._neighbors;
    },
  },
  'farthestNeighbor': {
    get: function() {
      let farthest = 0;
      for (let i = 0; i < this.neighbors.length; i++) {
        if (this === this.neighbors[i]) continue;
        let distance = dist(this.x + this.xspeed, this.y + this.yspeed, this.neighbors[i].x, this.neighbors[i].y);
        farthest = max(distance, farthest);
      }
      return farthest;
    }
  }
});
