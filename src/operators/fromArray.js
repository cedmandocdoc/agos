import Stream from "../Stream";
import create from "./create";
import filter from "./filter";
import listen from "./listen";
import { pipe } from "../utils";

const fromArray = (array, withIndex) =>
  create((open, next, fail, done, talkback) => {
    let cancelled = false;

    pipe(
      talkback,
      filter(data => data === Stream.CANCEL),
      listen(() => {
        cancelled = true;
        done(true);
      })
    );

    open();

    for (let index = 0; index < array.length; index++) {
      if (cancelled) break;
      const value = array[index];
      next(withIndex ? [value, index] : value);
    }
    done(false);
  });

export default fromArray;
