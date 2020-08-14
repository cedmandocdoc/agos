import create from "./create";
import never from "./never";
import Observable from "../Observable";
import { noop } from "../utils";

const fromObject = object =>
  create((open, next, fail, done, talkback) => {
    let cancelled = false;
    talkback.listen(
      noop,
      payload => {
        if (payload[0] === Observable.CANCEL) {
          cancelled = true;
          done(true);
        }
      },
      noop,
      noop,
      never()
    );
    open();
    const keys = Object.keys(object);
    for (let index = 0; index < keys.length; index++) {
      if (cancelled) break;
      const key = keys[index];
      const value = object[key];
      next([value, key]);
    }
    done(false);
  });

export default fromObject;
