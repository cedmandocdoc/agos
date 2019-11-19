# Agos

Agos `(Filipino translation of Stream)` is a library for reactive programming that helps to do an operation on stream of values
like DOM Events, WebSockets, Timer, and etc. The difference of agos on other reactive library is that a stream can have a different controls aside from stopping it.

## Example

```js
import Stream from "agos";

const interval = duration =>
  new Stream(sink => {
    let count = 0;
    let id = null;
    const play = () => {
      if (id) return;
      id = setInterval(() => sink.next(++count), duration);
    };
    const stop = () => {
      if (!id) return;
      clearInterval(id);
      id = null;
    };
    play(); // trigger play, as soon as start method calls
    return { play, stop };
  });

const stream = interval(100).start({
  next: count => console.log(count),
  error: error => console.log(error),
  complete: () => console.log("completed")
}); // start the stream at time 0

setTimeout(() => stream.stop(), 300); // fire stop method at time 300
setTimeout(() => stream.play(), 600); // fire play method at time 600
setTimeout(() => stream.stop(), 900); // fire stop method at time 900
```

## API

- [of](#of)
- [from](#from)
- [empty](#empty)
- [fail](#fail)
- [never](#never)
- [merge](#merge)
- [mergeLatest](#mergeLatest)
- [concat](#concat)
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
- [chain](#chain)
- [join](#join)
- [start](#start)

### <a id="of"></a> `of(value)`

Creates a Stream that emits the given argument, then completes.

- Arguments:
  - `value` type any, value that will be propagated.
- Return: Stream

---

### <a id="from"></a> `from(values)`

Creates a Stream that emits each item on the given array, then completes.

- Arguments:
  - `values` type array of any, array where each item will be coming from.
- Return: Stream

---

### <a id="empty"></a> `empty()`

Creates a Stream that immediately completes upon started.

- Return: Stream

---

### <a id="fail"></a> `fail(error)`

Creates a Stream that immediately emit an error upon started.

- Arguments:
  - `error` type any, value that will be propagated on sink error.
- Return: Stream

---

### <a id="never"></a> `never()`

Creates a Stream that does nothing.

- Return: Stream

---

### <a id="merge"></a> `merge(streams)`

Creates a Stream that emits all values received from the given streams.

- Arguments:
  - `streams` type array of stream where all data will be coming from.
- Return: Stream

### <a id="mergeLatest"></a> `mergeLatest(streams)`

Creates a Stream that emits all latest values received from the given streams.

- Arguments:
  - `streams` type array of stream where latest data will be coming from.
- Return: Stream

---

### <a id="concat"></a> `concat(streams)`

Creates a Stream that emits values received from the given streams, one after another completes.

- Arguments:
  - `streams` type array of stream where each data will be coming from.
- Return: Stream

---

### <a id="map"></a> `map(fn)`

Transform the received values through `fn` then propagates.

- Arguments:
  - `fn` type function, will propagate its return value.
- Return: Stream

---

### <a id="tap"></a> `tap(fn)`

Runs the `fn` whenever receives a value then propagate the value.

- Arguments:
  - `fn` type function, will propagate its received value.
- Return: Stream

---

### <a id="filter"></a> `filter(fn)`

Propagate the values received whenever `fn` returns true.

- Arguments:
  - `fn` type function, will propagate if returns true.
- Return: Stream

---

### <a id="skipWhile"></a> `skipWhile(fn)`

Propagate the values received whenever `fn` returns false.

- Arguments:
  - `fn` type function, will propagate if returns false.
- Return: Stream

---

### <a id="slice"></a> `slice(start, end)`

Slice the received valeus by an amount, this works like `slice` method of array in JavaScript.

- Arguments:
  - `start` type number, amount indication when it will propagate. Negative number indicate that it will offset from end, meaning an amount from end will not be propagated.
  - `end` type number, amount indication when it will propagate complete. Negative number indicate that it will offset from end, meaning an amount from end will be propagated then completes.
- Return: Stream

---

### <a id="skip"></a> `skip(amount)`

Skips an amount of values then propagates, same as `slice(amount)`.

- Arguments:
  - `amount` type number, count to skip.
- Return: Stream

---

### <a id="take"></a> `take(amount)`

Propagate an amount of values then completes, same as `slice(0, amount)`.

- Arguments:
  - `amount` type number, count to take.
- Return: Stream

---

### <a id="last"></a> `last()`

Store all values receives then propagates the last and then completes, Same as `slice(-1)`.

- Return: Stream

---

### <a id="takeWhile"></a> `takeWhile(fn)`

Propagates data whenever `fn` returns true else this will complete.

- Arguments:
  - `fn` type function, indication when only to take values.
- Return: Stream

---

### <a id="scan"></a> `scan(acc, initial)`

Propagates the accumulated data of `acc` function.

- Arguments:
  - `acc` type function, receives `accumulate` and `current` and returns new `accumulate`.
  - `initial` type any, value that will be received on `accumulate` on its first propagation.
- Return: Stream

---

### <a id="chain"></a> `chain(fn)`

Run each values to a Stream then merge to the output.

- Arguments:
  - `fn` type function that returns stream. Runs and start the return stream whenever receives a value.
- Return: Stream

---

### <a id="join"></a> `join(amount)`

Flatten the streams into one stream.

- Arguments:
  - `amount` type optional number default to 1, number of count to flatten stream.
- Return: Stream

---

### <a id="start"></a> `start(sink)`

Starts the stream, this will invoke the producer function.

- Arguments:
  - `sink` type object or function, object has three properties: `next` function where data will propagate, `complete` function where completion took and `error` function where error took.
- Return: object, this object is the return value of producer function.
