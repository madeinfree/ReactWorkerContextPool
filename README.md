# React Worker Pool Context Component

Reuse workers and management flexible, make browser main thread happily to render and feeling smooth.

## GIF

![GIF](./gif/workergif.gif)

## Experiment

目前為學習研究與實驗性質，請勿使用在正式環境中。

This project is in experiment, dont's use it on production environment.

## Why

Make browser main thread happily to render and feeling smooth.

The React is always sync now, if we have some cpu heavy computing, it will affect the main thread render, and the browser looks like delay we call frame drop, we can use browser native Worker API to handle the cpu heavy computing to cost down the CPU.

### Graph

(block)

- React Main Thread
- heavy computing thing
- React render reconciler(block and going) - 4ms
- heavy computing thing run(block and going) - 18ms
- broswer repaint/reflow(block and going)
- heavy computing thing
- React render reconciler(block and going) - 5ms
- heavy computing thing run(block and going) - 16ms
- broswer repaint/reflow(block and going)

(non-block)

- React Main Thread
  - heavy computing thing
  - call worker -------------->(thread non-block) - 1ms
- React render reconciler-----------|(block and going) - 2ms
- broswer repaint/reflow------------|(block and going)
  - worker done ------------->(thread non-block) - 1ms
- React render reconciler-----------|(block and going) - 3ms
- broswer repaint/reflow------------|(block and going)

## Core

Only `./src/ReactWorkerPool/index.tsx`

## Public API

- requestWorker(name: string; code: string; timeout?: number): (name: string)
- releaseWorker(name: string): boolean
- run(name: string; ...args: any): void;
- getResult: Promise\<any>

## Used

### The WorkerPool is base on React Context API so we import it and use it on top of other components which components want to use worker.

```jsx
import WorkerPool from "./ReactWorkerPool";

ReactDOM.render(
  <React.StrictMode>
    <WorkerPool>
      <App />
    </WorkerPool>
  </React.StrictMode>,
  document.getElementById("root")
);
```

### When we completed the Provider setup, and than go to the child component to useContext.

```jsx
import { WorkerPoolContext } from "./ReactWorkerPool";

const workerPool = useContext(WorkerPoolContext);
```

### The WorkerPool is big pool, it maintain all the worker, we will request the first Worker instance from useEffect.

```jsx
useEffect(() => {
  workerPool.requestWorker("count", code);
  workerPool.requestWorker("echo", echo);
}, [code, echo, workerPool]);
```

### Last, we can call worker anywhere.

```jsx
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
      <button onClick={clickToCount}>Click To Count From Child Thread</button>
      <div className="App-link">The total is: {sum}</div>
    </header>
  </div>
);
```

## Reference

- [alewin/useWorker](https://github.com/alewin/useWorker)
- [dai-shi/react-hooks-worker](https://github.com/dai-shi/react-hooks-worker)

## License

MIT
