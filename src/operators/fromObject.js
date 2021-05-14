import create from "./create";
import empty from "./empty";
import Stream from "../Stream";
import { noop } from "../utils";

const fromObject = (object, withIndex) =>
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
    const keys = Object.keys(object);
    for (let index = 0; index < keys.length; index++) {
      if (cancelled) break;
      const key = keys[index];
      const value = object[key];
      next(withIndex ? [value, key] : value);
    }
    done(false);
  });

export default fromObject;
