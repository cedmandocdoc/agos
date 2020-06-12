import create from "./create";
import never from "./never";
import { noop } from "../utils";
import { CANCEL } from "../constants";

const fromArray = array =>
  create((open, next, fail, done, talkback) => {
    let cancelled = false;
    talkback.listen(
      noop,
      payload => {
        if (payload[0] === CANCEL) {
          cancelled = true;
          done(true);
        }
      },
      noop,
      noop,
      never()
    );
    open();
    for (let index = 0; index < array.length; index++) {
      if (cancelled) break;
      next([array[index], index]);
    }
    done(false);
  });

export default fromArray;
