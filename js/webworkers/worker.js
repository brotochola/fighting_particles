self.addEventListener("message", (e) => {
  let date = performance.now();

  try {
    let actionToDo = e.data.msg;
    let dataWeGot = e.data.dataToPass;

    let resp = self[actionToDo](dataWeGot);

    self.postMessage({
      msg: "listo",
      resp,
      timeItTook: performance.now() - date,
    });
  } catch (err) {
    self.postMessage({ msg: "error", err });
  }

  // return arr;
});

self.findClosePeople = (obj) => {
  const { people, myX, myY, maxSight } = obj;

  const cheaperDist = (x1, y1, x2, y2) => {
    var a = x1 - x2;
    var b = y1 - y2;
    return Math.abs(a) + Math.abs(b);
  };

  let arr = people
    .map((k) => {
      return {
        dist: cheaperDist(myX, myY, k.x, k.y),
        part: k,
      };
    })
    .filter((k) => k.dist < maxSight);

  return arr.sort((a, b) => (a.dist > b.dist ? 1 : -1));
};
