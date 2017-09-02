function Bubble(x, y, radius, coloration, alpha, lifespan) {
  this.x = x;
  this.y = y;
  this.color = coloration.slice();
  this.startColor = coloration.slice();
  this.lifespan = lifespan;
  this.radius = radius;
  this.bounces = 0;
  this.maxBounces = 0;
  this.minBounces = 0;
  this.lastCollision = 0;
  this._momentum = [0, 0];
  this.elasticity = 0; //random(0.1, 0.650);
  this.alpha = alpha ? alpha : 127;
  this.neighbors = [];

  this._xspeed = random(-topSpeed / 3, topSpeed / 3);
  this._yspeed = random(-topSpeed / 3, topSpeed / 3);

  this.shareColor = function(other) {
    radii = (this.radius + other.radius) / 2;
    thisWeight = this.radius / radii;
    otherWeight = other.radius / radii;
    for (var i = 0; i < this.color.length; i++) {
      this.color[i] = sqrt(((thisWeight) * (this.color[i] ** 2) + (otherWeight) * (other.color[i] ** 2)) / 2);
      other.color[i] = this.color[i];
    }
  };

  this.move = function(others) {
    if (this.x - this.radius <= 0) {
      this.xspeed *= random(-1.025, -0.975);
      this.color = interpolateColors(this.color, [255, 0, 0], 0.33);
      this.bounces++;
    } else if (this.x + this.radius >= virtualWidth) {
      this.xspeed *= random(-1.025, -0.975);
      this.color = interpolateColors(this.color, [0, 0, 255], 0.33);
      this.bounces++;
    }
    if (this.y - this.radius <= 0) {
      this.yspeed *= random(-1.025, -0.975);
      this.color = interpolateColors(this.color, [0, 255, 0], 0.33);
      this.bounces++;
    } else if (this.y + this.radius >= virtualHeight) {
      this.yspeed *= random(-1.025, -0.975);
      this.color = interpolateColors(concentrateColor(this.color), this.color, 0.67);
      //this.color = invertColor(this.color);
      //this.color = interpolateColors(this.color, [0, 0, 0]);
      //this.color = interpolateColors(this.color, [random(0, 255), random(0, 255), random(0, 255)]);
      this.bounces++;
    }

    for (var i = 0; i < this.neighbors.length; i++) {
      if (dist(this.x + this.xspeed, this.y + this.yspeed, this.neighbors[i].x, this.neighbors[i].y) <= this.radius + this.neighbors[i].radius) {
        return;
      }
    }
    //if (this.neighbors.length > 0) return;
    this.x += this.xspeed;
    this.y += this.yspeed;
    this.x = constrain(this.x, 0 + this.radius, virtualWidth - this.radius);
    this.y = constrain(this.y, 0 + this.radius, virtualHeight - this.radius);
  }

  this.collision = function(other, others) {
    if (this == other) return;
    var xDistance = this.x + this.xspeed - other.x;
    var yDistance = this.y + this.yspeed - other.y;
    if (abs(xDistance) > searchSpace && abs(yDistance) > searchSpace) return;
    this.neighbors.push(other);
    var distance = sqrt(xDistance ** 2 + yDistance ** 2);
    if (distance <= (this.radius + other.radius)) {
      //this.lastCollision = other;
      let myWeight = (this.radius),
        otherWeight = (other.radius);
      weightRatio = myWeight / otherWeight;
      var distanceFactor = 1;

      var thisVector = this.momentum;
      var otherVector = other.momentum;

      //var thisRelative = acos(1);

      var bounceForce = 0; // (thisVector[1] * this.elasticity * weightRatio + otherVector[1] * other.elasticity / weightRatio);
      var thisXBounce = cos(thisVector[0] + Math.PI) * bounceForce;
      var thisYBounce = sin(thisVector[0] + Math.PI) * bounceForce;
      var otherXBounce = cos(otherVector[0] + Math.PI) * bounceForce;
      var otherYBounce = sin(otherVector[0] + Math.PI) * bounceForce;

      var xSum = (this.xspeed * weightRatio - other.xspeed / weightRatio); // this.xspeed + other.xspeed; //
      var ySum = (this.yspeed * weightRatio - other.yspeed / weightRatio); // this.yspeed + other.yspeed; //
      var myXSum = weightRatio * (this.xspeed - other.xspeed);
      var myYSum = weightRatio * (this.yspeed - other.yspeed);
      var otherXSum = (this.xspeed - other.xspeed) / weightRatio;
      var otherYSum = (this.yspeed - other.yspeed) / weightRatio;


      this.xspeed = thisXBounce + myXSum; // xSum; //* random(0.975, 1.025) * distanceFactor;
      this.yspeed = thisYBounce + myYSum; // * random(0.975, 1.025) * distanceFactor;
      other.xspeed = otherXBounce + otherXSum; //* random(0.975, 1.025) * distanceFactor;
      other.yspeed = otherYBounce + otherYSum; //* random(0.975, 1.025) * distanceFactor;
      this.shareColor(other);
      this.bounces++;
      other.bounces++;
    }

  };

  /*this.bounce = function(otherBubble) {
    var temp = [];
    for (var i = 0; i < 3; i++) {
      this.color[i] = Math.sqrt((this.color[i] ** 2) + (otherBubble.color[i] ** 2))
    }
    this.alpha = (this.alpha + otherBubble.alpha) / 2;
  };*/

  this.display = function(index, length) {
    stroke(invertColor(this.color));
    fill(this.color, this.alpha);
    ellipse(this.x, this.y, this.radius * 2, this.radius * 2);
  };
};

Object.defineProperties(Bubble.prototype, {
  'xspeed': {
    get: function() {
      return this._xspeed != 0 ? constrain(this._xspeed, -topSpeed, topSpeed) : random(-0.01, 0.01);
    },
    set: function(x) {
      this._xspeed = x != 0 ? constrain(x, -topSpeed, topSpeed) : random(-0.01, 0.01);
    }
  },
  'yspeed': {
    get: function() {
      return this._yspeed != 0 ? constrain(this._yspeed, -topSpeed, topSpeed) : random(-0.01, 0.01);
    },
    set: function(x) {
      this._yspeed = x != 0 ? constrain(x, -topSpeed, topSpeed) : random(-0.01, 0.01);
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
  }
});

function invertColor(color) {
  var tmp = [];
  for (var i = 0; i < color.length; i++)
    tmp[i] = color[i] ^ 0xFF;
  return tmp;
};

function interpolateColors(c1, c2, weight = 0.5) {
  var cc = [];
  otherWeight = (2 - 2 * weight);
  for (var i = 0; i < c1.length; i++)
    cc[i] = sqrt((weight * 2 * (c1[i] ** 2) + otherWeight * (c2[i] ** 2)) / 2);
  return cc;
};

function concentrateColor(color) {
  r = color[0];
  g = color[1];
  b = color[2];
  if (b < r && r > g) return [255, 0, 0];
  if (r < g && g > b) return [0, 255, 0];
  if (r < b && b > g) return [0, 0, 255];
  return [255, 255, 255];
};
