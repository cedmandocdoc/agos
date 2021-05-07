# Agos

JavaScript utility for data flow composition.

## Overview

Agos `(Filipino translation of Stream)` is a utility library that helps the data flow to be composed in a functional manner. It is inspired by other reactive libraries like RxJS, xstream and mostjs but with one key difference, the data source is naturally interactive. The general idea of the library is base on the article [Redefining Observarble](https://github.com/cedmandocdoc/redefining-observable), basically, it enables the data source to be reactive with an outside entity like an observer. It is also implements [Fantasy Land](https://github.com/fantasyland/fantasy-land) `Semigroup`, `Monoid`, `Functor`, `Apply`, `Applicative`, `Chain` and `Monad`.

## Installation

Install it using [npm](https://www.npmjs.com/package/agos) or [yarn](https://yarnpkg.com/package/agos).

```bash
npm install agos
```

## Example

```js
import Stream, { pipe, create, filter, subscribe } from "agos";

// create main source
const interval = create((open, next, fail, done, talkback) => {
  let count = 0;
  // propagate data
  const id = setInterval(() => next(++count), 100);

  // talkback is another stream that comes
  // from the outside this enable the main
  // source to be reactive on cancellation
  // or anything depending on the implementaion,
  // see that this piped stream filters only data
  // that pertains to Stream cancellation stopping
  // the data propagation
  pipe(
    talkback,
    filter(data => data === Stream.CANCEL),
    subscribe(() => {
      clearInterval(id);
      done(true)
    })
  )
  open();
});

// create cancel source
const cancel = create((open, next, fail, done) => {
  open();
  setTimeout(() => {
    // propagates CANCEL
    next(Stream.CANCEL);
    done(false);
  }, 500);
});

// listen to main source and 
// passing the cancel source to
// subscribe function
pipe(
  interval,
  subscribe({
    open: () => console.log("open"),
    next: value => console.log(value),
    fail: error => console.log(error),
    done: cancelled => console.log("done", "cancelled", cancelled),
  }, cancel)
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
