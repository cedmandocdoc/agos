import create from "./create";
import never from "./never";
import Stream from "../Stream";
import { noop } from "../utils";

const fromPromise = promise =>
  create((open, next, fail, done, talkback) => {
    open();
    promise
      .then(value => next(value))
      .catch(error => fail(error))
      .finally(() => done(false));
    talkback.listen(
      noop,
      payload => payload === Stream.CANCEL && done(true),
      noop,
      noop,
      never()
    );
  });

export default fromPromise;
