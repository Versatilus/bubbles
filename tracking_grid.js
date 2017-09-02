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
  removeFromGrid2(bubble);
  for (let k = yBottom; k <= yTop; k++) {
    for (let j = xBottom; j <= xTop; j++) {
      let index = k * gridX + j;
      Array.isArray(trackingGrid[index]) ?
        trackingGrid[index].push(bubble) :
        trackingGrid[index] = [bubble];
    }
  }
}


function addToGrid2(bubble) {
  const tx = ~~(bubble.x / gridSpanX);
  const ty = ~~(bubble.y / gridSpanY);
  const yBottom = constrain(ty - 1, 0, gridY - 1);
  const yTop = constrain(ty + 1, 0, gridY - 1);
  const xBottom = constrain(tx - 1, 0, gridX - 1);
  const xTop = constrain(tx + 1, 0, gridX - 1);
  for (let k = yBottom; k <= yTop; k++) {
    for (let j = xBottom; j <= xTop; j++) {
      let index = k * gridX + j;
      if (Array.isArray(trackingGrid[index])) {
        //for (var ii = 0; ii < trackingGrid[index].length; ii++)
        //trackingGrid[index][ii].hasMoved;
        trackingGrid[index].push(bubble);
      } else {
        trackingGrid[index] = [bubble];
      }
    }
  }
}



function removeFromGrid(bubble) {
  const tx = ~~(bubble.x / gridSpanX);
  const ty = ~~(bubble.y / gridSpanY);
  let counter = 0,
    i = 0;
  for (var k; k < trackingGrid.length; k++) {
    while ((i = trackingGrid[k].indexOf(bubble)) !== -1) {
      trackingGrid[k].splice(i, 1);
      counter++;
    }
  }
  return counter;
}

function removeFromGrid2(bubble) {
  const tx = ~~(bubble.x / gridSpanX);
  const ty = ~~(bubble.y / gridSpanY);
  let counter = 0,
    i = 0;
  const yBottom = constrain(ty - 2, 0, gridY - 1);
  const yTop = constrain(ty + 2, 0, gridY - 1);
  const xBottom = constrain(tx - 2, 0, gridX - 1);
  const xTop = constrain(tx + 2, 0, gridX - 1);
  for (let k = yBottom; k <= yTop; k++) {
    for (let j = xBottom; j <= xTop; j++) {
      let index = k * gridX + j;
      while ((i = trackingGrid[index].indexOf(bubble)) !== -1) {
        trackingGrid[index].splice(i, 1);
        counter++;
      }
      //for (var ii = 0; ii < trackingGrid[index].length; ii++)
      //trthisackingGrid[index][ii].hasMoved;
    }
  }
  //console.log(counter);
  return counter;
}

function getNeighborhoodFromGrid(x, y) {
  const row = ~~(y / gridSpanY);
  const column = ~~(x / gridSpanX);
  return Array.isArray(trackingGrid[row * gridX + column]) ? trackingGrid[row * gridX + column] : [];
}

function getGridCoordinates(x, y) {
  return [~~(x / gridSpanX), ~~(y / gridSpanY)];
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
