# Agos

JavaScript utility for data flow composition.

## Table of Contents

- [Overview](#overview)
- [Example](#example)
- [API](#api)
- [License](#license)

## Overview

Agos `(Filipino translation of Stream)` is a utility library that controls the data flow in functional manner. It consists one core type, Source and provides pure functions to create different types of Source.

Source acts as an event and control provider. It propagates the events down the pipe and could provide a control outside.

## Example

```js
import { create, listen, pipe } from "agos";

const interval = duration =>
  create(control => {
    let id = 0;
    let count = 0;

    const open = control.open(dispatch => {
      dispatch(); // open dispatch
      id = setInterval(() => {
        next(++count); // propagate count on next
      }, duration);
    });

    const next = control.next((dispatch, data) => dispatch(data)); // next dispatch

    const error = control.error((dispatch, error) => dispatch(error)); // error dispatch

    const close = control.close(dispatch => {
      clearInterval(id);
      id = 0;
      count = 0;
      dispatch(); // close dispatch
    });

    return { open, close }; // returns custom control
  });

const { open, close } = pipe(
  interval(100),
  listen({
    open: () => console.log("open"), // called upon dispatch of open
    next: count => console.log(count), // called upon dispatch of next
    error: error => console.log(error), // called upon dispatch of error
    close: () => console.log("close") // called upon dispatch of close
  })
);

open(); // fire open method immediately

setTimeout(() => close(), 300); // fire close method at time 300
setTimeout(() => open(), 600); // fire open method at time 600
setTimeout(() => close(), 900); // fire close method at time 900

// logs
// open   - immediate
// 1      - 100ms
// 2      - 200ms
// close  - 300ms
// open   - 600ms
// 1      - 700ms
// 2      - 800ms
// close  - 900ms
```

The `interval` function accepts a duration that indicates the millisecond count when to propagate, it then returns a Source that propagates a count through `next` upon open. Moreover, `control.open` returns a function that start the propagation and `control.close` returns a function that stop the propagation. The `dispatch` on both open and close indicates the propagation on open and close callback of the consumer that defines on `listen` method. Furthermore, `next` and `error` are both unary function, their first parameter is a dispatch method that dictates the propgation to the callback of consumer and their second parameter is the data and error respectively. Finally the source returns a custom control that could be use outside the source, on this example it has a custom control of open and close only but it could be any type of control.

## API

- Factory - function that creates Source. Below is the list of all available factories.

  - [create](#create)
  - [of](#of)
  - [from](#from)
  - [empty](#empty)
  - [fail](#fail)
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
  - [flatMap](#[flatMap)
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

### <a id="from"></a> `from(values)`

Creates a Source that emits each item on the given array, then completes.

- Arguments:
  - `values` array of any where each item will be coming from.
- Return: Source

---

### <a id="empty"></a> `empty()`

Creates a Source that immediately completes.

- Return: Source

---

### <a id="fail"></a> `fail(error)`

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

### <a id="flatMap"></a> `flatMap(project)`

Run each values to a Source then merge to the output.

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
