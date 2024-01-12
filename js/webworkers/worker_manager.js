// class Test {
//     constructor() {
//         this.bla = 1
//     }
//     sumar() {
//         this.bla++
//     }

// }
// let bla = new Test()

let workerManager = [];
for (let i = 0; i < navigator.hardwareConcurrency; i++) {
  let w = new Worker("js/webworkers/worker.js");
  w.i = i;
  w.onmessage = (e) => {
    //EXECUTE CALLBACK
    let myWorker = workerManager[w.i];
    // console.log(myWorker)
    if (myWorker.cb instanceof Function) myWorker.cb(e.data);
    else {
      debugger;
    }
    //AND EMPTY IT
    myWorker.status = "idle";
    myWorker.id = null;
    myWorker.cb = null;
  };
  w.onerror = (e) => {
    console.warn(e);
  };
  workerManager.push({ i: i, cb: null, worker: w, status: "idle", id: null });
}

const testFunc = (howMany) => {
  let arr = [];

  for (let i = 0; i < howMany; i++) {
    arr[i] = Math.random();
  }
  return arr;
};

// let lastWorkerUsed = 0

const mandarAProcesarEnSegundoPlano = (msg, dataToPass, cb) => {
  let w = workerManager.filter((k) => k.status == "idle")[0];
  if (!w) return; //console.warn("no workers available");
  // debugger

  w.cb = cb;

  w.status = "working";
  w.worker.postMessage({ msg, dataToPass });
  // lastWorkerUsed++
};

// //ASI SE USA:
// mandarAProcesarEnSegundoPlano(testFunc, 9959499, (e) => {
//   //   console.log("esta es la data:", e);
// });
