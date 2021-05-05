import create from "./create";
import never from "./never";
import Stream from "../Stream";
import { noop } from "../utils";

const of = value =>
  create((open, next, fail, done, talkback) => {
    talkback.listen(
      noop,
      payload => payload === Stream.CANCEL && done(true),
      noop,
      noop,
      never()
    );
    open();
    next(value);
    done(false);
  });

export default of;
