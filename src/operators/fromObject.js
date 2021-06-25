import Stream from "../Stream";
import create from "./create";
import filter from "./filter";
import listen from "./listen";
import { pipe } from "../utils";

const fromObject = (object, withIndex) =>
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
