# Agos

JavaScript utility for data flow composition.

## Overview

Agos `(Filipino translation of Stream)` is a utility library that helps the data flow to be composed in a functional manner. It is inspired by other reactive libraries like RxJS, xstream and mostjs but with one key difference, the data source is naturally interactive. The general idea of the library is base on the article [Redefining Observarble](https://github.com/cedmandocdoc/redefining-observable), basically, it enables the data source to be reactive with an outside entity like an observer. For more detailed documentation, check out the [wiki](https://github.com/cedmandocdoc/agos/wiki).

## Installation

Install it using [npm](https://www.npmjs.com/package/agos) or [yarn](https://yarnpkg.com/package/agos).

```bash
npm install agos
```

## Example

```js
import { create, never, listen, CANCEL } from "agos";

const noop = () => {};

// create main source
const interval = create((open, next, fail, done, talkback) => {
  let count = 0;
  // propagate data
  const id = setInterval(() => next(++count), 100);
  const clear = (payload) => {
    if (payload[0] === CANCEL) {
      clearInterval(id);
      done(true);
    }
  };

  // talkback is a data source come
  // from the outside, this enable
  // the main source to be reactive
  // on cancellation or anything,
  // depending on the implemnentaion
  talkback.listen(noop, clear, noop, noop, never);
  open();
});

// create cancel source
const cancel = create((open, next, fail, done) => {
  open();
  setTimeout(() => {
    // propagates CANCEL
    next([CANCEL]);
    done(false);
  }, 500);
});

// listen to main source
interval.listen(
  () => console.log("open"),
  (value) => console.log(value),
  (error) => console.log(error),
  (cancelled) => console.log("done", "cancelled", cancelled),
  cancel // provide the cancel source
);

// logs
// open
// 1
// 2
// 3
// 4
// done cancelled true
```

## License

This project is licensed under the MIT License - see the [LICENSE](https://github.com/cedmandocdoc/agos/blob/master/LICENSE) file for details.
