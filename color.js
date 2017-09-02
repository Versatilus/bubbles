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
}

function concentrateColor(color) {
  /*var tmp = [];
  for (var i = 0; i < color.length; i++)
    tmp[i] = (color[i] & 0xC0) >> ? 0xFF : 0;
  return tmp;*/
  if (color.length === 3) {
    r = color[0];
    g = color[1];
    b = color[2];
    r = (b <= r && r >= g) ? 255 : 0;
    g = (r <= g && g >= b) ? 255 : 0;
    b = (r <= b && b >= g) ? 255 : 0;
    return [r, g, b]; //[255, 255, 255];
  }
}

// simulating=0;clearInterval(simulationInterval); while(drawingFlag){} noLoop(); var benchmarkStart=window.performance.now(); for(var ii=0;ii<fps*60;ii++) simulateTimeStep(); console.log(window.performance.now()-benchmarkStart); loop();
