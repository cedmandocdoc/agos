import create from "./create";
import empty from "./empty";
import Stream from "../Stream";
import { noop } from "../utils";

const fromArray = (array, withIndex) =>
  create((open, next, fail, done, talkback) => {
    let cancelled = false;
    talkback.listen(
      noop,
      payload => {
        if (payload === Stream.CANCEL) {
          cancelled = true;
          done(true);
        }
      },
      noop,
      noop,
      empty()
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
