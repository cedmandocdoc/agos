import Stream from "../Stream";
import create from "./create";
import filter from "./filter";
import listen from "./listen";
import { pipe } from "../utils";

const fromPromise = promise =>
  create((open, next, fail, done, talkback) => {
    open();
    promise
      .then(value => next(value))
      .catch(error => fail(error))
      .finally(() => done(false));

    pipe(
      talkback,
      filter(data => data === Stream.CANCEL),
      listen(() => done(true))
    );
  });

export default fromPromise;
