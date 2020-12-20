import React, { useContext, useState, useEffect } from "react";
import logo from "./logo.svg";
import "./App.css";

import { WorkerPoolContext } from "./ReactWorkerPool";

const Echo = () => {
  const workerPool = useContext(WorkerPoolContext);

  const handleEcho = async (msg: string) => {
    workerPool.run("echo", msg);
    const data = await workerPool.getResult("echo");
    console.log(data);
    workerPool.run("count", [10, 250000000]);
    (async () => {
      const data = await workerPool.getResult("count");
      console.log(data);
    })();
  };

  return <button onClick={() => handleEcho("Hello World")}>Echo</button>;
};

let turn = 0;
function infiniteLoop() {
  const lgoo: any = document.querySelector(".App-logo");
  turn += 2;
  lgoo.style.transform = `rotate(${turn % 360}deg)`;
}

const App = () => {
  const workerPool = useContext(WorkerPoolContext);
  useEffect(() => {
    const loopInterval = setInterval(infiniteLoop, 100);
    return () => clearInterval(loopInterval);
  }, []);
  const [sum, setSum] = useState(0);
  const [num1] = useState(0);
  const [num2] = useState(1000000000);
  const echo = `self.onmessage = (e) => {
    const msg = e.data
    self.postMessage(msg)
  }`;
  const code = `self.onmessage = (e) => {
    const [num1, num2] = e.data
    let sum = 0
    for (let i = num1; i < num2; i++) {
      sum += i
    }
    self.postMessage(sum)
  }`;

  const runInMainThread = () => {
    let sum = 0;
    for (let i = num1; i < num2; i++) {
      sum += i;
    }
    setSum(sum);
  };

  useEffect(() => {
    workerPool.requestWorker("count", code);
    workerPool.requestWorker("echo", echo);
  }, [code, echo, workerPool]);

  useEffect(() => {
    workerPool.run("count", [num1, num2]);
    (async () => {
      const data = await workerPool.getResult("count");
      if (data) {
        setSum(data);
      }
      setTimeout(async () => {
        workerPool.run("count", [num1, 500]);
        const data = await workerPool.getResult("count");
        if (data) {
          setSum(data);
        }
      }, 500);
    })();
  }, [num1, num2, workerPool]);

  const clickToCount = async () => {
    workerPool.run("count", [num1, num2]);
    const data = await workerPool.getResult("count");
    if (data) {
      setSum(data);
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.tsx</code> and save to reload.
        </p>
        <button onClick={runInMainThread}>Click To Run In Main Thread</button>
        <button onClick={clickToCount}>Click To Count From Child Thread</button>
        <Echo />
        <div className="App-link">The total is: {sum}</div>
      </header>
    </div>
  );
};

export default App;
