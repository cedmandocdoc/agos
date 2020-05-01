# Agos

JavaScript utility for data flow composition.

## Table of Contents

- [Overview](#overview)
- [Example](#example)
- [API](#api)
- [License](#license)

## Overview

Agos `(Filipino translation of Stream)` is a utility library that controls the data flow in functional manner. It consists one core type, Source, which implements a run method with an open, next, fail, done callback function and a talkback which is another Source that can be listened.

## Example

```js
import { create, never, listen, pipe, CANCEL } from "agos";

const noop = () => {};

// main source
const interval = create((open, next, fail, done, talkback) => {
  let count = 0;
  const id = setInterval(() => next(++count), 100);

  // listen for cancellation
  talkback.listen(
    noop,
    (value) => {
      if (value === CANCEL) {
        clearInterval(id);
        done(true);
      }
    },
    noop,
    noop,
    never
  );
  open();
});

// cancel source
const cancel = create((open, next, fail, done) => {
  open();
  setTimeout(() => {
    // propagates CANCEL
    next(CANCEL);
    done(false);
  }, 500);
});

// listen to main source
pipe(
  interval,
  listen(
    () => console.log("open"),
    (value) => console.log(value),
    (error) => console.log(error),
    (cancelled) => console.log("done", "cancelled", cancelled),
    cancel // provide the cancel source
  )
);

// logs
// open
// 1
// 2
// 3
// 4
// done cancelled true
```

## API

- Factory - function that creates Source. Below is the list of all available factories.

  - [create](#create)
  - [of](#of)
  - [fromArray](#fromArray)
  - [empty](#empty)
  - [reject](#reject)
  - [never](#never)
  - [merge](#merge)
  - [mergeLatest](#mergeLatest)
  - [concat](#concat)

- Operator - function that composes a Source, below is the list of all available operators.

  - [map](#map)
  - [tap](#tap)
  - [filter](#filter)
  - [skipWhile](#skipWhile)
  - [slice](#slice)
  - [skip](#skip)
  - [take](#take)
  - [last](#last)
  - [takeWhile](#takeWhile)
  - [scan](#scan)
  - [join](#[join)
  - [chain](#[chain)
  - [listen](#listen)

### <a id="create"></a> `create(provider)`

Creates a Source given a provider function.

- Arguments:
  - `provider` function that dictates the event propagatation and control provision.
- Return: Source

### <a id="of"></a> `of(value)`

Creates a Source that emits the given argument, then completes.

- Arguments:
  - `value` any value that will be propagated.
- Return: Source

---

### <a id="fromArray"></a> `fromArray(values)`

Creates a Source that emits each item on the given array, then completes.

- Arguments:
  - `values` array of any where each item will be coming from.
- Return: Source

---

### <a id="empty"></a> `empty()`

Creates a Source that immediately completes.

- Return: Source

---

### <a id="reject"></a> `reject(error)`

Creates a Source that immediately emit an error.

- Arguments:
  - `error`: value that will be propagated on sink error.
- Return: Source

---

### <a id="never"></a> `never()`

Creates a Source that does nothing.

- Return: Source

---

### <a id="merge"></a> `merge(sources)`

Creates a Source that emits all values received from the given sources.

- Arguments:
  - `sources`: array of source where all data will be coming from.
- Return: Source

### <a id="mergeLatest"></a> `mergeLatest(sources)`

Creates a Source that emits all latest values received from the given sources.

- Arguments:
  - `sourcecs`: array of sourcce where latest data will be coming from.
- Return: Source

---

### <a id="concat"></a> `concat(sources)`

Creates a Source that emits values received from the given sources, one after another completes.

- Arguments:
  - `sources`: array of source where each data will be coming from.
- Return: Source

---

### <a id="map"></a> `map(project)`

Transform the received values through `project` function then propagates.

- Arguments:
  - `project`: function that transforms the received value.
- Return: Source

---

### <a id="tap"></a> `tap(fn)`

Runs the `fn` whenever receives a value then propagate the value.

- Arguments:
  - `fn`: function that runs whenever receives value.
- Return: Source

---

### <a id="filter"></a> `filter(predicate)`

Propagate the values received whenever `predicate` function returns true.

- Arguments:
  - `predicate`: function that indicates what it will propagate.
- Return: Source

---

### <a id="skipWhile"></a> `skipWhile(predicate)`

Propagate the values received whenever `predicate` function returns false.

- Arguments:
  - `predicate`: function that indicates when it will propagate.
- Return: Source

---

### <a id="slice"></a> `slice(start, end)`

Slice the received valeus by an amount, this works like `slice` method of array in JavaScript.

- Arguments:
  - `start`: number that indicates when it will propagate. Negative number indicate that it will offset from end, meaning an amount from end will not be propagated.
  - `end` number that indicates when it will propagate complete. Negative number indicate that it will offset from end, meaning an amount from end will be propagated then completes.
- Return: Source

---

### <a id="skip"></a> `skip(amount)`

Skips an amount of values then propagates, same as `slice(amount)`.

- Arguments:
  - `amount`: number of count to skip.
- Return: Source

---

### <a id="take"></a> `take(amount)`

Propagate an amount of values then completes, same as `slice(0, amount)`.

- Arguments:
  - `amount`: number of count to take.
- Return: Source

---

### <a id="last"></a> `last()`

Store all values receives then propagates the last and then completes, Same as `slice(-1)`.

- Return: Source

---

### <a id="takeWhile"></a> `takeWhile(predicate)`

Propagates data whenever `predicate` function returns true else this will complete.

- Arguments:
  - `predicate`: function that indicates when only to take values.
- Return: Source

---

### <a id="scan"></a> `scan(accumulator, initial)`

Propagates the accumulated data from the `accumulator` function.

- Arguments:
  - `accumulator`: function that receives accumulated data and current data then returns a new accumulated data.
  - `initial`: value that will be received on accumulated on first propagation.
- Return: Source

---

### <a id="join"></a> `join()`

Flatten each values of a Source.

- Return: Source

---

### <a id="chain"></a> `chain(project)`

Flatten the result of each project function of a Source.

- Arguments:
  - `project`: function that returns Source.
- Return: Source

---

### <a id="listen"></a> `listen(consumer)`

Initialize the source and attach callback functions to be consumed by the source.

- Arguments:
  - `consumer`: object with open, next, error and close methods or just a function that acts a next.
- Return: Any, returns the control provided by the source.

## License

[MIT](https://github.com/cedmandocdoc/agos/blob/master/LICENSE)
