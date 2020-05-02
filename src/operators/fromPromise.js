import create from "./create";
import never from "./never";
import { noop } from "../utils";
import { CANCEL } from "../constants";

const fromPromise = promise =>
  create((open, next, fail, done, talkback) => {
    open();
    promise
      .then(value => next(value))
      .catch(error => fail(error))
      .finally(() => done(false));
    talkback.listen(
      noop,
      value => value === CANCEL && done(true),
      noop,
      noop,
      never()
    );
  });

export default fromPromise;
