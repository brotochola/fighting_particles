function getAvg(grades) {
  if (!Array.isArray(grades)) return console.warn("no es un array");
  if (grades.length == 0) return 0;
  const total = grades.reduce((acc, c) => acc + c, 0);
  return total / grades.length;
}

function findParabolaCoefficients(vertex, point1, point2) {
  // Extracting coordinates from P5 Vectors
  const x0 = vertex.x,
    y0 = vertex.y;
  const x1 = point1.x,
    y1 = point1.y;
  const x2 = point2.x,
    y2 = point2.y;

  // Solving for coefficients
  let a =
    (y2 - y1) / ((x2 - x0) * (x2 - x1)) - (y1 - y0) / ((x1 - x0) * (x2 - x1));
  let b = (y1 - y0) / (x1 - x0) - a * (x0 + x1);
  const c = y0 - a * x0 ** 2 - b * x0;

  // Ensure a is negative
  if (a >= 0) {
    a = -a;
    b = -b;
  }

  return { a, b, c };
}
function mapLogExpValuesTo1(x) {
  if (x < 1) {
    return Math.PI ** (4 * x - 4) - 1;
  } else if (x > 1) {
    return Math.atan(x - 1) / (Math.PI * 0.5);
  } else if (x == 1) {
    return 0;
  }
}

function dist(x1, y1, x2, y2) {
  var a = x1 - x2;
  var b = y1 - y2;
  return Math.sqrt(a * a + b * b);
}

function distObjects(obj1, obj2) {
  var a = obj1.pos.x - obj2.pos.x;
  var b = obj1.pos.y - obj2.pos.y;
  return Math.sqrt(a * a + b * b);
}

function cheaperDist(x1, y1, x2, y2) {
  var a = x1 - x2;
  var b = y1 - y2;
  return Math.abs(a) + Math.abs(b);
}

function getRandomBrownishColor(minA, maxA) {
  let r = Math.floor(100 + Math.random() * 45);
  let g = Math.floor(20 + Math.random() * 40);
  let b = Math.floor(Math.random() * 50);

  if (minA == undefined) minA = 0;
  if (maxA == undefined) maxA = 1;

  let a = (minA + (maxA - minA) * Math.random()).toFixed(2);
  return { r, g, b, a };
  //   return "rgba(" + r + "," + g + "," + b + "," + a + ")";
}

const getRandomColor = () => Math.floor(Math.random() * 16777215).toString(16);

const generateID = () => {
  let vowels = "aeiou";
  let numbers = "0123456789";
  let name = Math.random().toString(36).substring(2, 9);
  let newName = "";
  for (let i = 0; i < name.length; i++) {
    try {
      let letter = name[i];
      let isItConsonant = vowels.indexOf(letter) == -1;
      let isPrevConsonant = vowels.indexOf(name[i - 1]) == -1;
      if (isItConsonant && isPrevConsonant)
        newName += vowels[Math.floor(Math.random() * vowels.length)];

      if (numbers.indexOf(letter) == -1) newName += letter;
    } catch (e) {}
  }
  newName = newName.substring(
    Math.floor(Math.random() * 4),
    Math.floor(Math.random() * 5 + 5)
  );
  if (newName.length < 4)
    newName += vowels[Math.floor(Math.random() * vowels.length)];

  return capitalize(newName);
};
function degreesToRadians(degrees) {
  return degrees * (Math.PI / 180);
}

function capitalize(word) {
  return word[0].toUpperCase() + word.slice(1).toLowerCase();
}
function makeRGBA(o) {
  let alpha = (o || {}).a || 1;

  if (isNaN(alpha)) alpha = 1;

  return (
    "rgba(" +
    Math.floor(o.r) +
    "," +
    Math.floor(o.g) +
    "," +
    Math.floor(o.b) +
    "," +
    alpha +
    ")"
  );
}

function unique(arr) {
  return [...new Set(arr)];
}

function colorChannelMixer(colorChannelA, colorChannelB, amountToMix) {
  var channelA = colorChannelA * amountToMix;
  var channelB = colorChannelB * (1 - amountToMix);
  return parseInt(channelA + channelB);
}
//rgbA and rgbB are arrays, amountToMix ranges from 0.0 to 1.0
//example (red): rgbA = [255,0,0]
function colorMixer(rgbA, rgbB, amountToMix) {
  var r = colorChannelMixer(rgbA[0], rgbB[0], amountToMix);
  var g = colorChannelMixer(rgbA[1], rgbB[1], amountToMix);
  var b = colorChannelMixer(rgbA[2], rgbB[2], amountToMix);
  return { r, g, b };
}

function rgba2hex(orig) {
  var a,
    isPercent,
    rgb = orig
      .replace(/\s/g, "")
      .match(/^rgba?\((\d+),(\d+),(\d+),?([^,\s)]+)?/i),
    alpha = ((rgb && rgb[4]) || "").trim(),
    hex = rgb
      ? (rgb[1] | (1 << 8)).toString(16).slice(1) +
        (rgb[2] | (1 << 8)).toString(16).slice(1) +
        (rgb[3] | (1 << 8)).toString(16).slice(1)
      : orig;

  if (alpha !== "") {
    a = alpha;
  } else {
    a = 0o1;
  }
  // multiply before convert to HEX
  a = ((a * 255) | (1 << 8)).toString(16).slice(1);
  hex = hex + a;

  return hex;
}

function rgba2hex2(rgba) {
  let newColor = rgba2hex(rgba);
  newColor = "0x" + newColor.substr(0, newColor.length - 2);
  return newColor;
}

function parseXmlToJSON(xmlString) {
  // Create an XML DOMParser
  const parser = new DOMParser();

  // Parse the XML string
  const xmlDoc = parser.parseFromString(xmlString, "text/xml");

  // Function to convert XML node to JSON
  function xmlNodeToJson(node) {
    const obj = {};

    // If the node has child nodes, recursively convert them
    if (node.childNodes.length > 0) {
      for (let i = 0; i < node.childNodes.length; i++) {
        const child = node.childNodes[i];

        // Ignore empty text nodes
        if (child.nodeType === 3 && !child.nodeValue.trim()) {
          continue;
        }

        // Check if the child is an element or a text node
        if (child.nodeType === 1) {
          // Element node
          if (obj[child.nodeName]) {
            if (Array.isArray(obj[child.nodeName])) {
              obj[child.nodeName].push(xmlNodeToJson(child));
            } else {
              obj[child.nodeName] = [obj[child.nodeName], xmlNodeToJson(child)];
            }
          } else {
            obj[child.nodeName] = xmlNodeToJson(child);
          }
        } else if (child.nodeType === 3) {
          // Text node
          obj["#text"] = child.nodeValue.trim();
        }
      }
    }

    // If the node has attributes, add them to the object
    if (node.attributes && node.attributes.length > 0) {
      obj["@attributes"] = {};
      for (let i = 0; i < node.attributes.length; i++) {
        const attribute = node.attributes[i];
        obj["@attributes"][attribute.nodeName] = attribute.nodeValue;
      }
    }

    return obj;
  }

  // Convert the root XML node to JSON
  return xmlNodeToJson(xmlDoc.documentElement);
}

function getMovieClipsFromFlashSymbolXML(obj) {
  let arrOfMCs =
    obj.timeline.DOMTimeline.layers.DOMLayer.frames.DOMFrame.elements
      .DOMSymbolInstance;

  return arrOfMCs.map((k) => {
    let pos = k.matrix.Matrix["@attributes"];
    let angle = getAngleAndPositions(pos.a, pos.b, pos.c, pos.d);
    return {
      x: pos.tx,
      y: pos.ty,
      type: k["@attributes"].libraryItemName,
      rotation: angle,
    };
  });
}

function rad2deg(rad) {
  return rad * 57.2958;
}

function getAngleAndPositions(a, b, c, d) {
  // Calculate the angle in radians using atan2
  let radians = Math.atan2(b, a);
  if (isNaN(radians)) radians = 0;

  // Return an object with angle (in radians), new x, and new y
  return radians;
}

function randomInt(max) {
  return Math.floor(Math.random() * (max + 1));
}

function randomBetween(min, max) {
  return Math.random() * (max - min) + min;
}
