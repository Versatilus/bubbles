function Bubble(x, y, radius, coloration, alpha) {
  this._x = x;
  this._y = y;
  this._center = [x, y];
  this.color = coloration.slice();
  this.startColor = coloration.slice();
  this._radius = radius;
  this._diameter = 2 * radius,
    this.bounces = 0;
  this.maxBounces = 0;
  this.minBounces = 0;
  this.lastCollision = 0;
  this._momentum = [0, 0];
  this.elasticity = random(0.51, 0.650);
  this.alpha = alpha ? alpha : 127;
  this._neighbors = [];
  this.burst = 0;
  this.growing = 0;
  this.topSpeed = topSpeed * random(0.9, 1.1);
  this.history = [createVector(x, y)];
  this._xspeed = random(-this.topSpeed / 3, this.topSpeed / 3);
  this._yspeed = random(-this.topSpeed / 3, this.topSpeed / 3);
  this.farthestNeighbor = 0;
  this.hasMoved = 0;
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
    this.growing = 0.25;
    this.yspeed *= random(-1.025, -0.975);
    //this.color = interpolateColors(this.color, [0], 0.05);
    this.color = interpolateColors(this.color, [0, 255, 0], 0.5);
    this.bounces++;
  } else if (this.y + this.radius >= virtualHeight) {
    this.growing = 0.25;
    this.yspeed *= random(-1.025, -0.975);
    //this.color = interpolateColors(this.color, [255], 0.5);
    this.color = interpolateColors(concentrateColor(this.color), this.color, 0.25);
    this.bounces++;
  }
  if (this.radius > maxRadius) {
    //this.color = [0]; // interpolateColors(this.color, [255], 0.5);
    this.radius = minRadius;
    //this.burst = 0.25;
    this.pop(0.25);
  }

  for (let i = 0; i < this.neighbors.length; i++) {
    if (this === this.neighbors[i]) continue;
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
        if (1.025 * xAverage > this.x && this.x > 0.975 * xAverage && 1.025 * yAverage > this.y && this.y > 0.975 * yAverage) {
          //this.radius = minRadius;
          //this.color = [0];
          this.pop(0.95);
        }
      }
      return;
    }
  }
  //if (this.neighbors.length > 0) return;
  this.radius += this.growing;
  this.growing = 0;
  this.center = [this.x + this.xspeed, this.y + this.yspeed];
  //this.history.push(createVector(this.x, this.y));
}

Bubble.prototype.collision = function(other) {
  if (this == other) return;
  const xDistance = this.x + this.xspeed - other.x;
  const yDistance = this.y + this.yspeed - other.y;
  //if (abs(xDistance) > searchSpace - 2 * topSpeed && abs(yDistance) > searchSpace - 2 * topSpeed) return;
  const distance = sqrt(xDistance ** 2 + yDistance ** 2);
  if (distance <= (this.radius + other.radius + (0.125 * (minRadius / this.radius)))) {
    this.growing = (0.125 * (maxRadius / (this.radius + (maxRadius - minRadius))));
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
  //stroke(invertColor(this.color));
  fill(this.color, this.alpha);
  ellipse(this.x, this.y, this.diameter, this.diameter);
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
  //this.x = bx;
  //this.y = by;
  this.topSpeed = topSpeed * random(0.9, 1.1);
  this.center = [bx, by];
  return 1;
};

Bubble.prototype.pop = function(intensity) {
  this.history = [];
  const concentrated = concentrateColor(this.color);
  fill(concentrated, 255);
  flashNeighborhood(this.x, this.y, concentrated);
  //ellipse(this.x, this.y, 2 * (this.farthestNeighbor), 2 * (this.farthestNeighbor));
  for (let j = 0; j < this.neighbors.length; j++) {
    if (this === this.neighbors[j]) continue;
    this.neighbors[j].color = interpolateColors(concentrated, this.neighbors[j].color, intensity);
  }
  this.radius = minRadius;
  //this.color = invertColor(this.color);
  return this.teleport();
}

Object.defineProperties(Bubble.prototype, {
  'x': {
    get: function() {
      return this._x;
    },
    set: function(xval) {
      //this.hasMoved = 1;
      let older = getGridCoordinates(this._x, this._y);
      let newer = getGridCoordinates(xval, this._y);
      if (older[0] != newer[0]) {
        removeFromGrid2(this);
        this._x = constrain(xval, 0 + this.radius, virtualWidth - this.radius);
        addToGrid2(this);
      } else {
        this._x = constrain(xval, 0 + this.radius, virtualWidth - this.radius);
      }
    },
  },
  'y': {
    get: function() {
      return this._y;
    },
    set: function(yval) {
      //this.hasMoved = 1;
      let older = getGridCoordinates(this._x, this._y);
      let newer = getGridCoordinates(this._x, yval);
      if (older[1] != newer[1]) {
        removeFromGrid2(this);
        this._y = constrain(yval, 0 + this.radius, virtualHeight - this.radius);
        addToGrid2(this);
      } else {
        this._y = constrain(yval, 0 + this.radius, virtualHeight - this.radius);
      }
    },
  },
  'center': {
    get: function() {
      return [this._x, this._y];
    },
    set: function(xyval) {
      //this.hasMoved = 1;
      let older = getGridCoordinates(this._x, this._y);
      let newer = getGridCoordinates(xyval[0], xyval[1]);
      if (older[0] != newer[0] || older[1] != newer[1]) {
        removeFromGrid2(this);
        this._x = constrain(xyval[0], 0 + this.radius, virtualWidth - this.radius);
        this._y = constrain(xyval[1], 0 + this.radius, virtualHeight - this.radius);
        addToGrid2(this);
      } else {
        this._x = constrain(xyval[0], 0 + this.radius, virtualWidth - this.radius);
        this._y = constrain(xyval[1], 0 + this.radius, virtualHeight - this.radius);
      }
    },
  },
  'xspeed': {
    get: function() {
      return this._xspeed; // != 0 ? constrain(this._xspeed, -topSpeed, topSpeed) : random(-0.01, 0.01);
    },
    set: function(x) {
      this._xspeed = x !== 0 ? constrain(x, -this.topSpeed, this.topSpeed) : random(-0.01, 0.01);
    }
  },
  'yspeed': {
    get: function() {
      return this._yspeed; // != 0 ? constrain(this._yspeed, -topSpeed, topSpeed) : random(-0.01, 0.01);
    },
    set: function(x) {
      this._yspeed = x !== 0 ? constrain(x, -this.topSpeed, this.topSpeed) : random(-0.01, 0.01);
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
      return this._diameter;
    },
    set: function(x) {
      this._radius = x / 2;
      this._diameter = x;
    }
  },
  'radius': {
    get: function() {
      return this._radius;
    },
    set: function(x) {
      this._radius = x;
      this._diameter = 2 * x;
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
