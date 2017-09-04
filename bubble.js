function Bubble(id, x, y, radius, coloration, alpha) {
    this.id = id >= 0 ? ~~id : ~~random(65536, 16776216);
    radius = radius ? radius : random(minRadius, maxRadius);
    this.body = Bodies.circle(x, y, radius, {
	restitution: 1,
        friction: 0,
	frictionAir: 0,
	frictionStatic: 0,
        density: 0.5,
	label: 'bubble'
    });
    this.body.owner = this;
    World.add(world, this.body);
    //    Matter.Body.applyForce(this.body, {x:width/2, y: height/2}, {x:random(-2,2),y:random(-2,2)});
    
    this.color = coloration ? coloration.slice() : [255, 255, 255];
    this.alpha = alpha ? alpha : 0xFF;
    this.startColor = this.color.slice();
    this.bounces = 0;
    this.burst = 0;
    this.growing = 0;
    this.topSpeed = topSpeed * random(0.9, 1.1);
    var va = random(TAU),
	rs = 3 + random(this.topSpeed),
	xspeed = cos(va) * rs,
	yspeed = sin(va) * rs;
    Matter.Body.setVelocity(this.body, {x: xspeed, y: yspeed});
    //this.xspeed = random(-this.topSpeed / 3, this.topSpeed / 3);
    //this.yspeed = random(-this.topSpeed / 3, this.topSpeed / 3);
}

Bubble.prototype.isOffscreen = function(){
    var position = this.body.position;
    var offscreen = (0 > position.x || position.x > width ||
		     0 > position.y || position.y > height);
    return offscreen;
}; 

Bubble.prototype.shareColor = function(other) {
    const radii = (this.radius + other.radius) / 2;
    const thisWeight = this.radius / radii;
    const otherWeight = other.radius / radii;
    let tmpColor = [];
    for (let i = 0; i < this.color.length; i++) {
	tmpColor[i] = sqrt(((thisWeight) * (this.color[i] ** 2) +
			    (otherWeight) * (other.color[i] ** 2)) / 2);
	other.color[i] = tmpColor[i];
    }
    this.color = tmpColor.slice();
};

Bubble.prototype.display = function() {
    push();
    noStroke();
    fill(this.color, this.alpha);
    translate(this.body.position.x, this.body.position.y);
    ellipse(0, 0, this.radius, this.radius);
    rotate(this.body.angle);
    strokeWeight(1);
    stroke(0);
    fill(0);
    line(0,0,this.radius,0);
    pop();
};

Bubble.prototype.teleport = function() {
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
	    if (dist(bx, by, neighbors[i].x, neighbors[i].y) <
		2.1 * (br + maxRadius + topSpeed)) {
		found = 0;
		tries++;
		bx = random(0 + br, virtualWidth - br);
		by = random(0 + br, virtualHeight - br);
		break;
	    }
	}
    }
    this.center = [bx, by];
    return 1;
};

Bubble.prototype.pop = function(intensity) {
    this.radius = minRadius;
    return this.teleport();
};

Object.defineProperties(Bubble.prototype, {
    'neighbors': {
	get: function() {
	    this._neighbors = getNeighborhoodFromGrid(this.x, this.y);
	    return this._neighbors;
	}
    },
    'center': {
	get: function() {
	    let position = this.body.position;
	    return [position.x, position.x];
	},
	set: function(xy) {
	    if(Array.isArray(xy)){
		xy = {'x': xy[0], 'y': xy[1]};
	    }
	    Matter.Body.setPosition(this.body, xy);
	}
    },
    'x': {
	get: function() {
	    return this.body.position.x;
	},
	set: function(x) {
	    Matter.Body.setPosition(this.body, {'x': x, 'y': this.body.position.y});
	}
    },
    'y': {
	get: function() {
	    return this.body.position.y;
	},
	set: function(y) {
	    Matter.Body.setPosition(this.body, {'x': this.body.position.x, 'y': y});
	}
    },
    'radius': {
	get: function() {
	    return this.body.circleRadius;
	},
	set: function(r) {
	    Matter.Body.scale(this.body, r/this.body.circleRadius, r/this.body.circleRadius);
	}
    }
});
