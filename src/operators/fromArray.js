import create from "./create";
import empty from "./empty";
import Stream from "../Stream";
import { noop } from "../utils";

const fromArray = array =>
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
      next([array[index], index]);
    }
    done(false);
  });

export default fromArray;
