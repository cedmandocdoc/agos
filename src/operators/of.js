import create from "./create";
import empty from "./empty";
import Stream from "../Stream";
import { noop } from "../utils";

const of = value =>
  create((open, next, fail, done, talkback) => {
    talkback.listen(
      noop,
      payload => payload === Stream.CANCEL && done(true),
      noop,
      noop,
      empty()
    );
    open();
    next(value);
    done(false);
  });

export default of;
